# Adding a Node to a Cluster with the CLI

Adding a node to a cluster involves managing transaction consistency and synchronization across all nodes. The CLI's `cluster` module uses two powerful tools to handle these challenges: pgBackRest, and the Spock extension. pgBackRest is used to create a backup of the source node, which is then restored on the target node, ensuring it starts as a replica of the source node. Then, while adding the target node to the cluster, the Spock extension's read-only mode ensures that the cluster remains consistent and no transactions are lost. Read-only mode is enabled on all nodes during the critical phases of this process, allowing for the safe addition of the new node and its seamless integration into the cluster.

**Best Practices**

To make node addition quick and safe, we recommend:
* Adding a node during a time that your cluster is less busy.
* Ensuring your application is not executing long running transactions during the node addition process.

!!! warning

    Understand that Spock's `read-only` mode will not automatically save transactions to retry them.  If a new transaction occurs during the time that the databases are in `read-only` mode, your application will have to apply them when `read-only` mode is disabled.

**Prerequisites**

Before invoking the `cluster add-node` command, you'll need to perform the following prerequisite steps on the host of the new node:

1. Configure [passwordless ssh](../prerequisites/index.md#configuring-passwordless-ssh) and [passwordless sudo](../prerequisites/index.md#configuring-passwordless-sudo).
2. Ensure the host where you plan to utilize the cluster module has the necessary permissions and SSH keys to access the cluster's source and target nodes.
3. Create the [target node configuration JSON](#creating-a-configuration-file-on-the-target-node) file (`target_node.json`) in the `pgedge` directory. If you are installing on localhost, this will be the `pgedge` directory that resides above your cluster.
4. Review your cluster's [pgBackRest installation](#configuring-pgbackrest) and make any modifications required for the add-node process.
5. Ensure that the `spock_version` property in the cluster's main configuration file (located in `pgedge/cluster/cluster_name`) contains a valid Spock version.

  When you add a new node to your cluster, the `cluster_name.json` file on each node will be updated with information about the new node as part of the process. The cluster configuration file must include a version number in the `spock_version` property:

```json
{
   "json_version":1.0,
   "cluster_name":"cluster1",
   "log_level":"info",
   "update_date":"2024-07-11 08:56:55GMT",
   "pgedge":{
      "pg_version":"16",
      "auto_start":"off",
      "spock":{
         "spock_version":"4.0",
         "auto_ddl":"off"
      }
```

## Configuring pgBackRest

If your cluster nodes are already configured to use pgBackRest for backup and restore, the existing repository for the source node will be used as a source file for the target node. 
 
!!! info

    If you are not using pgBackRest as a backup solution, pgBackRest will be used for the add-node operation and cleaned up when the operation completes.

The add-node process typically requires that the target node has access to the source node's backup repository on a network share or via access to an S3 bucket. If this is not possible in your infrastructure setup, you can move the repository manually to the target node, place it in the same directory with appropriate permissions configured, and perform the add-node operation. This approach may require specifying a `backup_id`, and extending WAL retention on the source node via the `wal_keep_size` parameter.

**Posix-based Storage**
If you are using a Posix-based file system for your backup storage, you must ensure that the target node has access to the source node's existing repository on a network share at the same mounted location. 

**AWS S3 Storage**
If you're using an AWS S3 bucket for your backups, add the following lines to the `~/.bashrc` file on the target node to ensure the files are accessible.

```bash
export PGBACKREST_REPO1_S3_KEY=AIYFHTUJVLPPE
export PGBACKREST_REPO1_S3_BUCKET=bucket-876t3xpf
export PGBACKREST_REPO1_S3_KEY_SECRET=G9tlpTwj2+yTKLO3qMjeKG9a7GkR4mo
export PGBACKREST_REPO1_S3_ENDPOINT=s3.amazonaws.com
export PGBACKREST_REPO1_S3_REGION=eu-west-2
```

If you are using encryption in your `repo1_cipher_type` configuration, you must also add this line to the `~/.bashrc` file on each node to set the cipher pass for encryption / decryption:

```
export PGBACKREST_REPO1_CIPHER_PASS=YourCipherPassHere
```

!!! note

`PGBACKREST_REPO1_S3_KEY` and `PGBACKREST_REPO1_S3_KEY_SECRET` are not required if you wish to use the built-in credential chain using instance roles on AWS Virtual Machines.

## Creating a Configuration File on the Target Node

Before adding a new node to a cluster, you must create a .json file that defines the target node (the new node).  You create the `target_node.json` file in the `pgedge` installation directory for the cluster; this is also the directory from which you will invoke the `cluster add-node` command. For example, to add a fourth node to a cluster on a localhost, create a file named `n4.json` in the cluster's `pgedge` directory that contains:

```json
{
 "json_version": 1.0,
 "node_groups": [
      {
      "ssh": {
        "os_user": "ec2-user",
        "private_key": ""
      },
      "name": "n4",
      "is_active": "on",
      "public_ip": "127.0.0.1",
      "private_ip": "127.0.0.1",
      "port": "6435",
      "path": "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n4"
      }
  ]
}
```

!!! info

    If you include [pgBackRest configuration settings](../managing/pgbackrest.md#configuring-pgbackrest-when-you-deploy-a-cluster) in the target node's JSON file, the pgBackRest configuration will be applied automatically when the add-node operation is completed.

## Deploying the New Node

Once your target node JSON configuration is setup, to add the target node to the cluster, navigate into the cluster's `pgedge` directory and invoke the [`cluster add-node` command](../pgedge_commands/doc/cluster-add-node.md):

`./pgedge cluster add-node CLUSTER_NAME SOURCE_NODE TARGET_NODE optional_flags` 

Where: 
 * CLUSTER_NAME is the name of the cluster to which the node is being added.
 * SOURCE_NODE is the name of the source node from which configurations and data are copied.
 * TARGET_NODE is the name of the new node being added.

Optionally include:
* -r or --repo1_path=REPO1_PATH to specify the repository path for pgBackRest. The `repo1-path` flag is useful when pgBackRest is not in use currently in the cluster, as a method to specify where the repository should be configured temporarily to perform the add-node operation. If not provided, it will default to `/var/lib/pgbackrest`, which must be accessible from both the source and target node.
* -b or --backup_id=BACKUP_ID to specify the ID of the backup to restore from. The `backup_id` flag is useful to specify a backup label other than the latest backup (the default when the target node is restored from the source node's repository). In cases where a network share or S3 bucket is not available, and you are manually moving the repository to a location accessible by the target node, you may need to set this location for the operation to succeed.
* -s or --script=SCRIPT to specify the name of a bash script to execute after the target node is added.
* -i or --install=INSTALL to perform a pgEdge installation on the target node. Defaults to `True`.

For example, to add a new node named `n4` to a cluster named `demo`, use the command:

`./pgedge cluster add-node demo n1 n4`

Before adding the node, pgEdge Platform validates the .json file; then installation details are displayed while the new node is added. When the process completes, a listing of cluster nodes will confirm addition of the new node:

```bash
May 28, 2025, 11:48:09: 127.0.0.1 : n4 - Listing spock nodes                                       
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n4/pgedge/; ./pgedge spock node-list lcdb" 

[
  {
    "node_id": 49708,
    "node_name": "n1"
  },
  {
    "node_id": 26863,
    "node_name": "n2"
  },
  {
    "node_id": 9057,
    "node_name": "n3"
  },
  {
    "node_id": 64086,
    "node_name": "n4"
  }
]

May 28, 2025, 11:48:10: 127.0.0.1 : n1 - List nodes                                                
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n1/pgedge/pgedge psql 'select node_id,node_name from spock.node' lcdb" 

 node_id | node_name 
---------+-----------
   49708 | n1
   26863 | n2
    9057 | n3
   64086 | n4
(4 rows)
```

After the node list, a list of subscriptions confirms that the new node is acting as a subscriber and a provider in your cluster:

```bash
May 28, 2025, 11:48:11: 127.0.0.1 : n1 - List subscriptions                                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n1/pgedge/pgedge psql 'select sub_id,sub_name,sub_enabled,sub_slot_name,sub_replication_sets from spock.subscription' lcdb" 

   sub_id   | sub_name | sub_enabled |    sub_slot_name     |         sub_replication_sets          
------------+----------+-------------+----------------------+---------------------------------------
 3293941396 | sub_n1n2 | t           | spk_lcdb_n2_sub_n1n2 | {default,default_insert_only,ddl_sql}
 1919895280 | sub_n1n3 | t           | spk_lcdb_n3_sub_n1n3 | {default,default_insert_only,ddl_sql}
 2583525863 | sub_n1n4 | t           | spk_lcdb_n4_sub_n1n4 | {default,default_insert_only,ddl_sql}
(3 rows)

May 28, 2025, 11:48:11: 127.0.0.1 : n2 - List subscriptions                                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n2/pgedge/pgedge psql 'select sub_id,sub_name,sub_enabled,sub_slot_name,sub_replication_sets from spock.subscription' lcdb" 

   sub_id   | sub_name | sub_enabled |    sub_slot_name     |         sub_replication_sets          
------------+----------+-------------+----------------------+---------------------------------------
 3651191944 | sub_n2n1 | t           | spk_lcdb_n1_sub_n2n1 | {default,default_insert_only,ddl_sql}
  923363493 | sub_n2n3 | t           | spk_lcdb_n3_sub_n2n3 | {default,default_insert_only,ddl_sql}
 1001814148 | sub_n2n4 | t           | spk_lcdb_n4_sub_n2n4 | {default,default_insert_only,ddl_sql}
(3 rows)

May 28, 2025, 11:48:12: 127.0.0.1 : n3 - List subscriptions                                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n3/pgedge/pgedge psql 'select sub_id,sub_name,sub_enabled,sub_slot_name,sub_replication_sets from spock.subscription' lcdb" 

   sub_id   | sub_name | sub_enabled |    sub_slot_name     |         sub_replication_sets          
------------+----------+-------------+----------------------+---------------------------------------
 2615912954 | sub_n3n1 | t           | spk_lcdb_n1_sub_n3n1 | {default,default_insert_only,ddl_sql}
 1118534372 | sub_n3n2 | t           | spk_lcdb_n2_sub_n3n2 | {default,default_insert_only,ddl_sql}
 4271755599 | sub_n3n4 | t           | spk_lcdb_n4_sub_n3n4 | {default,default_insert_only,ddl_sql}
(3 rows)

May 28, 2025, 11:48:13: 127.0.0.1 : n4 - List subscriptions                                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n4/pgedge/pgedge psql 'select sub_id,sub_name,sub_enabled,sub_slot_name,sub_replication_sets from spock.subscription' lcdb" 

   sub_id   | sub_name | sub_enabled |    sub_slot_name     |         sub_replication_sets          
------------+----------+-------------+----------------------+---------------------------------------
  721773034 | sub_n4n1 | t           | spk_lcdb_n1_sub_n4n1 | {default,default_insert_only,ddl_sql}
 2167208351 | sub_n4n2 | t           | spk_lcdb_n2_sub_n4n2 | {default,default_insert_only,ddl_sql}
 2065094438 | sub_n4n3 | t           | spk_lcdb_n3_sub_n4n3 | {default,default_insert_only,ddl_sql}
(3 rows)

```
When the node addition completes, the CLI cleans up the artifacts used during the process, and confirms the port on which the new node is available:

```bash
May 28, 2025, 11:48:16: 127.0.0.1 : n4 - Cleaning up replica configuration                         [OK]
May 28, 2025, 11:48:16: 127.0.0.1 : n4 - Removing backrest from target node                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n4/pgedge && ./pgedge remove backrest" 

backrest removing

## Modify 'postgresql.conf' #########################
  new: archive_command = ''
  new: archive_mode = 'off'
pg17 stopping
pg17 starting on port 6438
Successfully removed the component backrest

May 28, 2025, 11:48:18: 127.0.0.1 : n4 - Removing backrest from target node                        [OK]
```
