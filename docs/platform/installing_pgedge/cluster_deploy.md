# Tutorial - Using the CLI Cluster Module to Deploy a Distributed Cluster

pgEdge Distributed Postgres supports modules that simplify deployment and management of a Postgres cluster.  One of those modules is the `cluster` module; this tutorial focuses on using `cluster` module functionality to deploy a distributed cluster.  The CLI `cluster` module allows you to:

* use the `pgedge cluster json-create` command to create a cluster definition file that defines a distributed replication cluster.
* validate the file with the `pgedge cluster json-validate` command.
* deploy the cluster with the `pgedge cluster-init` command. 
  
You can use these commands on either remote hosts or a single local host.  When you are happy with your cluster configuration, you can reuse the configuration file to deploy another cluster with the same configuration by modifying the cluster details and initializing another cluster with new node details.

!!! hint

    Deploying multiple nodes on the same host is a great way to experiment with active-active replication deployments.

This tutorial creates a three node cluster; before starting this tutorial, you should prepare three EL9 or Ubuntu 22.04 Linux server(s) by:

* [Setting SELinux to `permissive` or `disabled` mode on each host](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/changing-selinux-states-and-modes_using-selinux), followed by a system reboot.
* Configuring [passwordless sudo access](../prerequisites/index.md#configuring-passwordless-sudo) for a non-root OS user on each host.
* Configuring [passwordless ssh](../prerequisites/index.md#configuring-passwordless-ssh) access for the same non-root OS user on each host.
* Opening any firewalls that could obstruct access between your nodes.

Then, install the CLI on each host used in the cluster with the command:

`python3 -c "$(curl -fsSL https://downloads.pgedge.com/platform/repos/download/install.py)"`

Paste the command into your command line client and press `Return`.

## Deploying a Cluster with the cluster Module

Then, move into the `pgedge` directory, and perform the following steps.

1. [Create a cluster_name.json](../installing_pgedge/json.md#creating-a-cluster-configuration-file) file with the command:

    `./pgedge cluster json-create demo 3 lcdb admin password --port=6432`
  
  The command opens a wizard that prompts you for information about your configuration and installation preferences; when the wizard completes, it creates your cluster configuration file in `pgedge/cluster/cluster_name/cluster_name.json`.

!!! info

    Note that the cluster definition wizard will prompt you for configuration details for pgBackRest; if you provide those details in the configuration file, pgBackRest will be configured and deployed with your cluster.

2. [Validate the cluster_name.json](../installing_pgedge/json.md#validating-a-cluster-configuration-file) file with the command:
   
    `./pgedge cluster json-validate demo`

  Note that while the `cluster json-validate` command verifies that the json form of the file is correct, it does not verify connection properties.

3. [Deploy the cluster](../installing_pgedge/json.md#using-the-cluster-module-to-deploy-a-cluster) with the command:
   
    `./pgedge cluster init demo`

  As the cluster deploys, the installer echoes the progress onscreen; when the installation completes, you can perform the following steps to exercise your new cluster.

### Adding Tables to the `default` Replication Set

For replication to begin, you will need to add tables to the `default` replication set; we'll use pgbench to create those tables. When you open pgbench or psql, specify the port number and database name to ensure you're working on the correct node. Before starting, source the environment variables on each node to add pgbench and psql to your OS PATH; for example:

```sql
source ~/demo/n1/pgedge/pg17/pg17.env
source ~/demo/n2/pgedge/pg17/pg17.env
source ~/demo/n3/pgedge/pg17/pg17.env
```

Then, use pgbench to set up a very simple four-table database. At the OS command line, create the pgbench tables in your database (`db_name`) with the `pgbench` command. You must create the tables on each node in your replication cluster:

```sh
pgbench -i --port=6432 lcdb
```

Then, connect to each node with the psql client:

```sh
psql -p 6432 -d lcdb
```

Once connected, alter the numeric columns, making the numeric fields conflict-free delta-apply columns, ensuring that the value replicated is the delta of the committed changes (the old value plus or minus any new value) to a given record.  If your cluster is configured to use Spock extension 4.0 (or later) use the commands:

```sql
ALTER TABLE pgbench_accounts ALTER COLUMN abalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
ALTER TABLE pgbench_branches ALTER COLUMN bbalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
ALTER TABLE pgbench_tellers ALTER COLUMN tbalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
```

Then, exit psql:

```sql
db_name=# \q
```
 
On the OS command line for each node, use the `pgedge spock repset-add-table` command to add the tables to the system-created replication set (named `default`); the command is followed by your database name (`db_name`):

```sql
./pgedge spock repset-add-table default 'pgbench_*' db_name
Adding table public.pgbench_accounts to replication set default.
Adding table public.pgbench_branches to replication set default.
Adding table public.pgbench_history to replication set default.
⚠ table pgbench_history cannot be added to replication set default
⚠ DETAIL:  table does not have PRIMARY KEY and given replication set is configured to replicate UPDATEs and/or DELETEs
Adding table public.pgbench_tellers to replication set default.
```

 The fourth table, `pgbench_history`, is excluded from the replication set because it does not have a primary key.

### Check the Configuration

On the psql command line, check the configuration on each node with the following SQL statements:

```sql
db_name=# SELECT * FROM spock.node;
  node_id  | node_name | location | country | info 
-----------+-----------+----------+---------+------
 193995617 | n3        |          |         | 
 673694252 | n1        |          |         | 
 560818415 | n2        |          |         | 
(3 rows)

```
and:

```sql
db_name=# SELECT sub_id, sub_name, sub_slot_name, sub_replication_sets  FROM spock.subscription;
   sub_id   | sub_name |      sub_slot_name       |         sub_replication_sets          
------------+----------+--------------------------+---------------------------------------
 3293941396 | sub_n1n2 | spk_lcdb_n2_sub_n1n2 | {default,default_insert_only,ddl_sql}
 1919895280 | sub_n1n3 | spk_lcdb_n3_sub_n1n3 | {default,default_insert_only,ddl_sql}
(2 rows)
```

The `sub_replication_sets` column shown above displays the system-created replication sets. You can add custom replication sets with the [`spock repset-create`](../pgedge_commands/spock.md) and [`spock sub-add-repset`](../pgedge_commands/spock.md) commands.

### Test Replication

Now, if you update a row on `n1`, you should see the update to the same row on `n2` and `n3`.

On `n1`:

```sql
db_name=# SELECT * FROM pgbench_tellers WHERE tid = 1;
 tid | bid | tbalance | filler
-----+-----+----------+--------
   1 |   1 |    	0 |
 (1 row)
```

```sql
db_name=# UPDATE pgbench_tellers SET filler = 'test' WHERE tid = 1;
UPDATE 1
```

Check `n2`:

```sql
db_name=# SELECT * FROM pgbench_tellers WHERE tid = 1;
 tid | bid | tbalance | filler  	 
-----+-----+----------+--------------------------------------------------
   1 |   1 |    	0 | test                               
(1 row)
```

You can also use pgbench to exercise replication; exit psql:

```sql
db_name=# exit
```

Then, run the following command on all nodes at the same time to run pgbench for one minute. 

```sql
pgbench -R 100 -T 60 -n --port=port_number db_name
```

When you connect with psql and check the results on both nodes, you'll see that the sum of the `tbalance` columns match on both `pgbench_tellers` tables. Without the conflict-free delta-apply columns, each conflict would have resulted in accepting the first in, potentially leading to sums that do not match between nodes.
 
`n1`:

```sql
db_name=# SELECT SUM(tbalance) FROM pgbench_tellers;
  sum  |
 ------+
 -101244
(1 row)
```

`n2`:

```sql
db_name=# SELECT SUM(tbalance) FROM pgbench_tellers;
  sum  |
 ------+
 -101244
(1 row)
```
