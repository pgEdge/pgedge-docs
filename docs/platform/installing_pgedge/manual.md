# Tutorial - Manually Configuring a Multi-Master Cluster with the CLI

The CLI's `setup` command used in this deployment method is designed to create clusters with nodes that reside on different hosts, and have unique IP addresses. In this tutorial, we will install a multi-master pgEdge Distributed Postgres cluster, manually create the nodes and subscriptions, and then use pgbench to create some tables and perform some read/write activity on the cluster.

!!! info
    
    If you are deploying a multi-master cluster with nodes that reside on the same host (for exploration and experimentation), we recommend using the [cluster module for deployment](../installing_pgedge/cluster_deploy.md). The cluster module also has the added benefit of performing an automated deployment and configuration of [pgBackRest](../managing/pgbackrest.md) on your new cluster.

Before starting this tutorial, you should prepare two (or more) Linux servers running EL9 or Ubuntu 22.04 *on separate hosts*.  On each machine:

* [Set SELinux to `permissive` or `disabled` mode on each host](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/changing-selinux-states-and-modes_using-selinux), followed by a system reboot.
* Configure [passwordless sudo access](../prerequisites/index.md#configuring-passwordless-sudo) for a non-root OS user on each host.
* Configure [passwordless ssh](../prerequisites/index.md#configuring-passwordless-ssh) access for the same non-root OS user on each host.
* Open any firewalls that could obstruct access between your servers.

Then, install the CLI on each node with the command:

`python3 -c "$(curl -fsSL https://downloads.pgedge.com/platform/repos/download/install.py)"`

Paste the command into your command line client and press `Return`.

After [installing the CLI](../installing_pgedge/manual.md), you can use the CLI's [`setup` command](../pgedge_commands/setup/index.md) to create a cluster. The `setup` command supports clauses that specify details such as:

 * the name of the user that will own the database (`-U` or `--User=user_name`); required
 * the password for the user (`-P` or `--passwd=password`); required
 * the name of the database (`-d` or `--dbname=database_name`); required
 * a port number for the cluster (`--port=port_number`)
 * a non-default location for the Postgres `data` directory (--pg_data=path_to_data_directory)
 * a specific Postgres version (`--pg_ver=version`)
 * a specific Spock version (`--spock_ver=version`)
 * your autostart preferences (`--autostart=True|False`). 
 
 The `setup` command installs:

* the [pgEdge Distributed Postgres (VM Edition)](../pgedge_commands/index.md) Command Line Interface. 
* pgEdge Distributed Postgres.
* [Spock](https://github.com/pgedge/spock), an extension that provides logical, asynchronous, multi-master replication.
* [Snowflake](https://github.com/pgEdge/snowflake), an extension that provides robust sequences for distributed clusters.
* other extensions that support database management on a distributed cluster.

On each server that will host a cluster node, move into the `pgedge` directory, and invoke the [`setup`](../pgedge_commands/doc/setup.md) command: 

`./pgedge setup -U db_superuser_name -P db_superuser_password -d db_name`

For example, the following command installs the CLI and creates a pgEdge Distributed Postgres database named `acctg`, with a database superuser named `admin`, whose password is `1safe_password`:

`./pgedge setup -U admin -P 1safe_password -d acctg`

The `setup` command creates a database superuser with the name and password you provide after the `-U` flag. The user cannot have the name of an OS superuser, `pgedge`, or any of the [Postgres reserved words](https://www.postgresql.org/docs/15/sql-keywords-appendix.html). In the examples that follow, that user is named `admin`.

The `setup` command also creates a [Postgres replication role](https://www.postgresql.org/docs/17/role-attributes.html) with the same name as the OS user that invokes the `setup` command, and adds the username and the scrambled password to the `./pgpass` file. 

## Creating Nodes

After installing the CLI and running [setup](../pgedge_commands/doc/setup.md), we'll use [spock node-create](../pgedge_commands/doc/spock-node-create.md) to create a *replication node* on each host. A replication node is a named collection of databases, tables, and other artifacts that are replicated via a Spock subscription. The syntax is:

`./pgedge spock node-create node_name 'host=IP_address_of_n1 user=replication_user_name dbname=db_name' db_name`

When invoking `pgedge spock node-create`, provide three arguments: 

* a name for the node (in our examples, `n1` and `n2`).
* a single-quoted connection string that specifies the node's IP address (for example, `10.0.0.5|10.0.0.6`), the name of an OS user (`rocky`), and the database name (`acctg`).
* the last argument repeats the database name (`acctg`).

For example, to create node `n1`:

```sql
./pgedge spock node-create n1 'host=10.0.0.5 user=rocky dbname=acctg' acctg
```

To create node `n2`:

```sql
./pgedge spock node-create n2 'host=10.0.0.6 user=rocky dbname=acctg' acctg
```

!!! hint

    If you use the following node naming convention: n1, n2, n3, etc., the [`postgresql.conf` file](../managing/guc_values.md) will be automatically updated to enable Snowflake sequences on your cluster.

## Creating Subscriptions

Next, create the subscriptions that connect the nodes to each other. Since this is a multi-master replication system, each node acts as both a subscriber and a publisher. Use the command:

```sql
./pgedge spock sub-create subscription_name 'host=IP_address_of_publisher port=port_number user=replication_user_name dbname=db_name' db_name
```

When invoking `pgedge spock sub-create`, provide three arguments: 

* a unique subscription name for each node (in the examples that follow, `sub_n1n2` and `sub_n2n1`).
* a single-quoted connection string that specifies the IP address of the node you're subscribing to (in our examples, `10.0.0.5` and `10.0.0.6`), the Postgres port on the publisher node (`5432`), the name of the replication user (`rocky`), and the database name (`acctg`).
* the last argument repeats the database name (`acctg`).

For example, if  you have a two node cluster, you'll create two subscriptions; one that subscribes node 1 to node 2 and one that subscribes node 2 to node 1:

On node `n1`:

```sql
./pgedge spock sub-create sub_n1n2 'host=10.0.0.6 port=5432 user=rocky dbname=acctg' acctg
```

On node `n2`:

```sql
./pgedge spock sub-create sub_n2n1 'host=10.0.0.5 port=5432 user=rocky dbname=acctg' acctg
```

## Adding Tables to the Replication Set

For replication to begin, you will need to add tables to the replication set; for this example, we'll use pgbench to add some tables. When you open pgbench or psql, specify your database name after the utility name.

On each node, source the environment variables to add pgbench and psql to your OS PATH; this will make it easier to move between the nodes:

```sql
source pg17/pg17.env
```

Then, use pgbench to set up a very simple four-table database. At the OS command line, (on each node of your replication set), create the pgbench tables in your database (`db_name`) with the `pgbench` command. You must create the tables on each node in your replication cluster:

```sql
pgbench -i db_name
```

Then, connect to each node with the psql client:

```sql
psql db_name
```

Once connected, alter the numeric columns, making the numeric fields conflict-free delta-apply columns, ensuring that the value replicated is the delta of the committed changes (the old value plus or minus any new value) to a given record.  Use the commands:

```sql
ALTER TABLE pgbench_accounts ALTER COLUMN abalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
ALTER TABLE pgbench_branches ALTER COLUMN bbalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
ALTER TABLE pgbench_tellers ALTER COLUMN tbalance SET (log_old_value=true, delta_apply_function=spock.delta_apply);
```

Then, exit psql:

```sql
db_name=# exit
```
 
On the OS command line for each node, use the `pgedge spock repset-add-table` command to add the tables to the system-created replication set (named `default`); the command is followed by your database name (`db_name`):

```sql
./pgedge spock repset-add-table default 'pgbench_*' db_name
```

 The fourth table, `pgbench_history`, is excluded from the replication set because it does not have a primary key.

## Checking the Configuration

On the psql command line, check the configuration on each node with the following SQL statements:

```sql
psql db_name

db_name=# SELECT * FROM spock.node;
node_id | node_name
---------+----------
673694252 | n1
560818415 | n2
(2 rows)
```
and:

```sql
db_name=# SELECT sub_id, sub_name, sub_slot_name, sub_replication_sets FROM spock.subscription;
   sub_id   | sub_name |	sub_slot_name 	|                	sub_replication_sets             
------------+----------+----------------------+--------------------------------------------------------
 3293941396 | sub_n1n2 | spk_db_name_n2_sub_n1n2 | {default,default_insert_only,ddl_sql}
(1 row)
```

The `sub_replication_sets` column shown above displays the system-created replication sets. You can add custom replication sets with the [`spock repset-create`](../pgedge_commands/doc/spock-repset-create.md) and [`spock sub-add-repset`](../pgedge_commands/doc/spock-sub-add-repset.md) commands.

## Testing Replication

Now, if you update a row on `n1`, you should see the update to the same row on `n2`.

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

Then, run the following command on both nodes at the same time to run pgbench for one minute. 

```sql
pgbench -R 100 -T 60 -n db_name
```

When you connect with psql and check the results on both nodes, you'll see that the sum of the `tbalance` columns match on both `pgbench_tellers` tables. Without the conflict-free delta-apply columns, each conflict would have resulted in accepting the first in, potentially leading to sums that do not match between nodes.
 
`n1`:

```sql
db_name=# SELECT SUM(tbalance) FROM pgbench_tellers;
  sum  |
 ------+
 -84803
(1 row)
```

`n2`:

```sql
db_name=# SELECT SUM(tbalance) FROM pgbench_tellers;
  sum  |
 ------+
 -84803
(1 row)
```


