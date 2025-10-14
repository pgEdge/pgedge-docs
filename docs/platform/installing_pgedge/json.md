# Creating and Modifying a Cluster Configuration File

You can use the CLI's `cluster` module to create a cluster configuration file that deploys and configures a pgEdge Distributed Postgres cluster, optionally running pgBackRest. The configuration file (`pgedge/cluster/cluster_name/cluster_name.json`) contains detailed information about your cluster; that information is used by [CLI management commands](../pgedge_commands.mdx) like `cluster add-node`, `cluster remove-node`, and the ACE extension. 

**Overview - deploying a cluster with a cluster configuration file**

The cluster configuration file can simplify cluster deployment; the steps are simple:

1. Use the [`pgedge cluster json-create`](#creating-a-cluster-configuration-file) command to create a cluster definition file that defines your replication cluster and provides connection information to each node host.
2. Validate the `cluster_name.json` file with the [`pgedge cluster json-validate`](#validating-a-cluster-configuration-file) command. 
3. Deploy the cluster with the [`pgedge cluster-init`](#using-the-cluster-module-to-deploy-a-cluster) command. 
   
If you are happy with your cluster configuration, reusing the configuration file to deploy another similar cluster is simply a matter of modifying the cluster details and initializing another cluster with a new configuration file with the new node details. 

!!! info

    Before creating a cluster configuration file and deploying as described in the sections that follow, you first need to satisfy the prerequisites and [install the CLI](../installing_pgedge.mdx).

To review a tutorial with detailed configuration and deployment steps, visit [here](../installing_pgedge/cluster_deploy.mdx).

## Creating a Cluster Configuration File

After installing the CLI, you can use the `cluster json-create` command to create a `cluster_name.json` file:

```
./pgedge cluster json-create cluster_name node_count db_name db_superuser password --port=port_number --pg_data=path_to_data_directory --pg_ver=pg_version -force
```

When you invoke the command, specify the following values for the required arguments:

* `cluster_name` is the name of the cluster. A directory with this same name will be created in the `cluster` directory; the file describing the cluster configuration will be named `cluster_name.json`.
* `db_name` is the name of your Postgres database.
* `node_count` specifies the number of nodes that will be in the cluster. Nodes will be named `n1`, `n2`, `n3`, etc.
* `db_superuser` specifies the username of the database owner/superuser that will be created for this database.
* `password` is the password of the database superuser.

Optionally, include:

* the `--port` flag and the port number to assign a listener port for the Postgres database.
* the `--pg_data` flag and the complete path to the location in which you'd like to create the Postgres `data` directory. 
* the `--pg_ver` flag and the Postgres version you'd like to install.
* the `--force` flag to suppress execution of a script that will prompt you for detailed configuration information for each node.

If you do not include the `--force` option, when you press return, the command initiates a script that prompts you for detailed information about each node your cluster. 

After providing the versions or accepting defaults for the Postgres and Spock versions, you will be asked if you would like to enable [pgBackRest](../managing/pgbackrest.mdx) on each node of the cluster; if you answer `Y(es)`, you are prompted for pgBackRest installation details. pgBackRest will be installed and configured on each node when you initiate the cluster deployment:

```sh

./pgedge cluster json-create demo 2 lcdb admin password --port=6432

PostgreSQL version ['15', '16', '17'] (default: '16'): 
Spock version ['3.3.6', '3.3.5', '4.0.10', '4.0.9', '4.0.8'] (default: '4.0.10'): 
Enable pgBackRest? (Y/N) (default: 'N'): Y
   pgBackRest storage path (default: '/var/lib/pgbackrest'): 
   pgBackRest archive mode (on/off) (default: 'on'): 
   pgBackRest repository type (posix/s3) (default: 'posix'): 

Configuring Node 1
  Public IP address for Node 1 (default: '127.0.0.1'): 
  Private IP address for Node 1 (default: '127.0.0.1'): 
  Using port 6432 for Node 1 

Configuring Node 2
  Public IP address for Node 2 (default: '127.0.0.1'): 
  Private IP address for Node 2 (default: '127.0.0.1'): 
  Using port 6433 for Node 2 

Configuring Node 3
  Public IP address for Node 3 (default: '127.0.0.1'): 
  Private IP address for Node 3 (default: '127.0.0.1'): 
  Using port 6434 for Node 3 

################################################################################
# Cluster Name       : demo
# PostgreSQL Version : 16
# Spock Version      : 4.0.10
# Number of Nodes    : 3
# Database Name      : lcdb
# User               : lcusr
# pgBackRest Enabled : Yes
#    Storage Path    : /var/lib/pgbackrest
#    Archive Mode    : on
#    Repository Type : posix
# Node 1
#    Public IP       : 127.0.0.1
#    Private IP      : 127.0.0.1
#    Port            : 6432
# Node 2
#    Public IP       : 127.0.0.1
#    Private IP      : 127.0.0.1
#    Port            : 6433
# Node 3
#    Public IP       : 127.0.0.1
#    Private IP      : 127.0.0.1
#    Port            : 6434
################################################################################
Do you want to save this configuration? (Y/N) (default: 'Y'): y

```

Specify `Y` to write the details to the `cluster.json` file (located in `pgedge/cluster/cluster_name/cluster_name.json`), or `N` to skip file creation.  After creating the file, you can manually edit the file to correct or add any important information about the cluster.
 
!!! info

    To suppress the script execution, include the `--force` flag when you invoke the `./pgedge cluster json-create` command; if you do not run the script, you will need to manually update the file to include any missing properties or provide node details.

### Inside the Cluster Configuration File

The `cluster json-create` command creates a JSON file that you can use to deploy a distributed cluster.  After cluster deployment, the file provides information for CLI commands (like cluster add-node) and the ACE extension that is used when modifying, monitoring, or repairing a cluster. The `cluster_name.json` file contains the following cluster details:

```sql
{
  "json_version": "1.0",
  "cluster_name": "demo",
  "log_level": "debug",
  "update_date": "2025-05-05T15:02:53.675145+00:00",
  "pgedge": {
    "pg_version": "16",
    "auto_start": "off",
    "spock": {
      "spock_version": "4.0.10",
      "auto_ddl": "on"
    },
    "databases": [
      {
        "db_name": "lcdb",
        "db_user": "lcusr",
        "db_password": "password"
      }
    ]
  },
  "node_groups": [
    {
      "ssh": {
        "os_user": "ec2-user",
        "private_key": ""
      },
      "name": "n1",
      "is_active": "on",
      "public_ip": "127.0.0.1",
      "private_ip": "127.0.0.1",
      "port": "6432",
      "path": "/home/ec2-user/demo/n1",
      "pg_data": "/home/pgedge/default/n1/pgedge/data/pg16",
      "backrest": {
        "stanza": "demo_stanza_n1",
        "repo1_path": "/var/lib/pgbackrest/n1",
        "repo1_retention_full": "7",
        "log_level_console": "info",
        "repo1_cipher-type": "aes-256-cbc",
        "archive_mode": "on",
        "repo1_type": "posix"
      }
    },
    {
      "ssh": {
        "os_user": "ec2-user",
        "private_key": ""
      },
      "name": "n2",
      "is_active": "on",
      "public_ip": "127.0.0.1",
      "private_ip": "127.0.0.1",
      "port": "6433",
      "path": "/home/ec2-user/demo/n2",
      "pg_data": "/home/pgedge/default/n1/pgedge/data/pg16",
      "backrest": {
        "stanza": "demo_stanza_n2",
        "repo1_path": "/var/lib/pgbackrest/n2",
        "repo1_retention_full": "7",
        "log_level_console": "info",
        "repo1_cipher-type": "aes-256-cbc",
        "archive_mode": "on",
        "repo1_type": "posix"
      }
    },
    {
      "ssh": {
        "os_user": "ec2-user",
        "private_key": ""
      },
      "name": "n3",
      "is_active": "on",
      "public_ip": "127.0.0.1",
      "private_ip": "127.0.0.1",
      "port": "6434",
      "path": "/home/ec2-user/demo/n3",
      "pg_data": "/home/pgedge/default/n1/pgedge/data/pg16",
      "backrest": {
        "stanza": "demo_stanza_n3",
        "repo1_path": "/var/lib/pgbackrest/n3",
        "repo1_retention_full": "7",
        "log_level_console": "info",
        "repo1_cipher-type": "aes-256-cbc",
        "archive_mode": "on",
        "repo1_type": "posix"
      }
    }
  ]
}
```

### Cluster Configuration Properties

Properties within the cluster configuration file describe a cluster:

| Property | Description |
|----------|-------------|
| json_version | The version of the json file being used. |
| cluster_name | The name of the cluster. |
| log_level | Optional; specify `debug` to produce verbose logging. |
| update_date | The most recent modification date of the cluster configuration file. |
| pgedge -> pg_version | The installed Postgres version. | 
| pgedge -> autostart | The state of the autostart feature; accepted values are `on` and `off`. |
| pgedge -> spock_version | The installed version of the Spock extension. |
| pgedge -> auto_ddl | The state of the `auto_ddl` feature; accepted values are `on` and `off`. |
| pgedge -> databases -> db_name | The name of the database created during the installation. |
| pgedge -> databases -> db_user | The name of the database superuser created when the cluster is deployed. |
| pgedge -> databases -> db_password | The password used by the database superuser to connect to the database. |
| node_groups -> ssh -> os_user | The name of an existing non-root operating system user. |
| node_groups -> ssh -> private_key | The path to and name of the SSH private key file on the cluster host. |
| node_groups -> name | The unique name of a cluster node (default values are `n1`, `n2`, `n3`, etc.). |
| node_groups -> is_active | The state of the node; accepted values are `on` and `off`. |
| node_groups -> public_ip | The public IP address of the node. If only a public IP address is provided, it will be used for both replication and SSH connections. If a public IP address and private IP address are provided, the public address will be used for SSH connections.|
| node_groups -> private_ip | The private IP address of the node. If only a private IP address is provided, it will be used for both replication and SSH connections. If a public IP address and private IP address are provided, the private address will be used for replication connections.|
| node_groups -> port | The Postgres listener port. |
| node_groups -> path | The complete installation path to the node's installation directory. |
| node_groups -> pg_data | The complete installation path to the node's `data` directory. |
| node_groups -> backrest -> stanza | The location of the pgBackRest stanza (configuration) file. |
| node_groups -> backrest -> repo1-path | The path to the pgBackRest repository. |
| node_groups -> backrest -> repo1-retention-full | The pgBackRest retention options. |
| node_groups -> backrest -> log-level-console | The pgBackRest log level setting. |
| node_groups -> backrest -> repo1-cipher-type | The pgBackRest cipher type. |
| node_groups -> backrest -> archive_mode | Specifies if pgBackRest archiving is `on` or `off`.|
| node_groups -> backrest -> repo1_type | The type of repository storage. The CLI currently supports `s3` and `posix`. |
| node_groups -> replicas | The number of read-only replica nodes. |
| node_groups -> sub_nodes | The configuration details for a read-only replica node. |
| node_groups -> sub_nodes -> ssh -> os_user | The name of an existing non-root operating system user on the sub node. |
| node_groups -> sub_nodes -> ssh -> private_key | The path to and name of the SSH private key file on the sub node. |
| node_groups -> sub_nodes -> name | The name of the sub node host. |
| node_groups -> sub_nodes -> is_active | The state of the sub node; the value should be `off` when acting as a supporting read-only node. |
| node_groups -> sub_nodes -> public_ip | The public IP address of the sub node. If only a public IP address is provided, it will be used for both replication and SSH connections. If a public IP address and private IP address are provided, the public address will be used for SSH connections.|
| node_groups -> sub_nodes -> private_ip | The private IP address of the sub node. If only a private IP address is provided, it will be used for both replication and SSH connections. If a public IP address and private IP address are provided, the private address will be used for replication connections.|
| node_groups -> sub_nodes -> port | The Postgres listener port on the sub node. |
| node_groups -> sub_nodes -> path | The complete installation path to the sub node's installation directory. |
| node_groups -> sub_nodes -> backrest -> stanza | The location of the pgBackRest stanza (configuration) file on the sub node. |
| node_groups -> sub_nodes -> backrest -> repo1-path | The path to the pgBackRest repository on the sub node. |
| node_groups -> sub_nodes -> backrest -> repo1-retention-full | The pgBackRest retention options on the sub node. |
| node_groups -> sub_nodes -> backrest -> log-level-console | The pgBackRest log level setting on the sub node.. |
| node_groups -> sub_nodes -> backrest -> repo1-cipher-type | The pgBackRest cipher type on the sub node. |
| node_groups -> sub_nodes -> backrest -> archive_mode | Specifies if pgBackRest archiving is `on` or `off` on the sub node.  If archiving is enabled, the archive command will be configured on each node to utilize pgBackRest, enabling you to leverage the point-in-time recovery capabilities when restoring from backup.|


### Validating a Cluster Configuration File

You can use the [`pgedge cluster json-validate`](../pgedge_commands/doc/cluster-json-validate.md) command to verify that your file is structured properly. The syntax is:

```bash
    ./pgedge cluster json-validate cluster_name
```

For example, the following command validates the .json file that creates a cluster named `demo`.

```bash
    ./pgedge cluster json-validate demo
    JSON defines a 3 node cluster
```
 
!!! info

    The validate command checks only the structure of the .json file; it does not validate the values or connection properties you provide.

### Using the cluster Module to Deploy a Cluster 

The `cluster` module streamlines cluster creation by using information provided in a configuration file to describe the cluster details and connection attributes in an easy-to-create/easy-to-edit file.  After [creating the configuration file](#creating-a-cluster-configuration-file), you can invoke the [`pgedge cluster init`](../../pgedge_commands/doc/cluster-init.md) command to deploy the defined cluster.  The cluster deployment syntax is:

```sql
    ./pgedge cluster init cluster_name
```

As the CLI executes this command, it creates each node with: 

* the latest minor release of your specified version of Postgres
* a Postgres database
* the Spock and Snowflake extensions (installed and configured for your cluster) 
* the `default` replication set
* subscriptions between nodes that enable active-active replication  
* Optionally, [pgBackRest](../../managing/pgbackrest.mdx)

**Example** 

The following command deploys a cluster named `demo`, described in the `demo.json` file:

```sh
./pgedge cluster init demo
```

### Understanding the Cluster Deployment Log

As the `cluster init` command executes, the CLI displays information about the installation.  The displayed output first confirms that each node in the configuration file is accessible:

```
$ ./pgedge cluster init demo
## Loading cluster 'demo' JSON definition file
## Checking SSH connectivity for all nodes
May 06, 2025, 13:56:32: 127.0.0.1 : n1 - Checking SSH connectivity on 127.0.0.1                    
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "hostname" 

ip-172-31-19-120.ec2.internal

May 06, 2025, 13:56:32: 127.0.0.1 : n1 - Checking SSH connectivity on 127.0.0.1                    [OK]
May 06, 2025, 13:56:32: 127.0.0.1 : n2 - Checking SSH connectivity on 127.0.0.1                    
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "hostname" 

ip-172-31-19-120.ec2.internal

May 06, 2025, 13:56:32: 127.0.0.1 : n2 - Checking SSH connectivity on 127.0.0.1                    [OK]
May 06, 2025, 13:56:32: 127.0.0.1 : n3 - Checking SSH connectivity on 127.0.0.1                    
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "hostname" 

ip-172-31-19-120.ec2.internal

May 06, 2025, 13:56:32: 127.0.0.1 : n3 - Checking SSH connectivity on 127.0.0.1                    [OK]
```

Then, the installer displays information about the installation version:

```
## Installing pgEdge on all nodes
###########################################################################
#              REPO: https://downloads.pgedge.com/platform/repos/download

#      Cluster Name: demo
#         Node Name: n1
#           Host IP: 127.0.0.1
#              Port: 6432
# Installation Path: /home/ec2-user/demo/n1
#          Database: lcdb
#     Database User: lcusr
#       Total Nodes: 3
###########################################################################
May 06, 2025, 13:56:32: 127.0.0.1 : n1 - Installing pgEdge on n1                                   
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "export REPO=https://downloads.pgedge.com/platform/repos/download/; mkdir -p /home/ec2-user/demo/n1; cd /home/ec2-user/demo/n1; python3 -c \"\$(curl -fsSL https://downloads.pgedge.com/platform/repos/download/install.py)\"" 

Downloading CLI 25.0.0...
Unpacking ...
Retrieving the remote list of latest component versions ...
Validating checksum file...
Updating local repository with remote entries...
 
################################################################################
#     Version: pgEdge 25.0.0
# User & Host: ec2-user  ip-172-31-19-120.ec2.internal  /home/ec2-user/demo/n1/pgedge
#          OS: Red Hat Enterprise Linux9.4 (Plow), glibc-2.34, Python 3.9.18 ()
#     Machine: 7 GB
#  Cloud Info: aws  ec2  i-03f76bd5e8ba60184  t4g.large  us-east-1b
#    Repo URL: https://pgedge-download.s3.amazonaws.com/REPO/stable/0501
# Last Update: 2025-05-06 13:56:36
################################################################################

########### Installing ctlibs ###############
  ['ctlibs']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO/stable/0501 ctlibs-1.6

Unpacking ctlibs-1.6.tgz
Downloading https://pgedge-download.s3.amazonaws.com/REPO/stable/0501/ctlibs-py3.9-arm.tgz
moving py3.9-arm to ../hub/scripts/lib/

pgedge cli installed.

May 06, 2025, 13:56:42: 127.0.0.1 : n1 - Installing pgEdge on n1                                   [OK]
May 06, 2025, 13:56:42: 127.0.0.1 : n1 - Setting up pgEdge on n1                                   
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge setup -U lcusr -P '???' -d lcdb --port 6432 --pg_ver 16 --spock_ver 4.0.10" 

  Verify spock '4.0.10' is valid and unique
    Component    Version  Released  IsCurrent
    spock40-pg16 4.0.10-1 20250224  1

######### pgEdge Setup Info ###########
#      User: lcusr
#  Database: lcdb:6432
#  Postgres: 16
#     Spock: 4.0.10
# Autostart: False
#  Platform: py3.9-arm
#######################################
```

The installer downloads and installs the CLI and Postgres:

```
#
#  ./pgedge install pg16

########### Installing pg16 ###############
  ['pg16']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO/stable/0501 pg16-16.8-1-arm
   50 MB [47%]
  100 MB [95%]
  104 MB [100%]

Unpacking pg16-16.8-1-arm.tgz
#
#  ./pgedge init pg16

## Initializing pg16 #######################

Initializing Postgres DB with:
  /home/ec2-user/demo/n1/pgedge/pg16/bin/initdb -U ec2-user -A scram-sha-256 -E UTF8 --data-checksums -D "/home/ec2-user/demo/n1/pgedge/data/pg16" --pwfile="/home/ec2-user/demo/n1/pgedge/pg16/.pgpass" > "/home/ec2-user/demo/n1/pgedge/data/logs/pg16/install.log" 2>&1
ssl = on
Password securely remembered
 
#
#  ./pgedge config pg16 --port=6432

Using PostgreSQL Port 6432
#
#  ./pgedge start pg16
pg16 starting on port 6432
#   ./pgedge pgbin 16 "psql -q -c \"CREATE ROLE lcusr PASSWORD '???' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN\" postgres"
#   ./pgedge pgbin 16 "psql -q -c \"CREATE ROLE replicator PASSWORD '???' SUPERUSER LOGIN REPLICATION\" postgres"
#   ./pgedge pgbin 16 "createdb 'lcdb' --owner='lcusr'"
#   ./pgedge tune pg16
Tuning 'postgresql.conf' parms for 'pg16':
  new: shared_buffers = 1872MB
  new: maintenance_work_mem = 749MB
  new: wal_log_hints = on
  new: effective_cache_size = 6GB
  new: log_min_duration_statement = 1000
  new: shared_preload_libraries = 'pg_stat_statements'
#   ./pgedge install snowflake-pg16 --no-restart
```
Next, the snowflake and spock extensions are added, created, and configured:
```
########### Installing snowflake-pg16 ###############
  ['snowflake-pg16']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO/stable/0501 snowflake-pg16-2.2-1-arm

Unpacking snowflake-pg16-2.2-1-arm.tgz
  new: shared_preload_libraries = 'pg_stat_statements, snowflake'

#   ./pgedge install spock40-pg16 4.0.10 -d lcdb

########### Installing spock40-pg16 ###############
  ['spock40-pg16']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO/stable/0501 spock40-pg16-4.0.10-1-arm
    1 MB [100%]

Unpacking spock40-pg16-4.0.10-1-arm.tgz
  new: wal_level = 'logical'
  new: max_worker_processes = 12
  new: max_replication_slots = 16
  new: max_wal_senders = 16
  new: hot_standby_feedback = 'on'
  new: wal_sender_timeout = '5s'
  new: track_commit_timestamp = 'on'
  new: spock.conflict_resolution = 'last_update_wins'
  new: spock.save_resolutions = 'on'
  new: spock.conflict_log_level = 'DEBUG'
  new: shared_preload_libraries = 'pg_stat_statements, snowflake, spock'

pg16 stopping
pg16 starting on port 6432

$ pg16/bin/psql -p 6432 -c "CREATE EXTENSION IF NOT EXISTS spock CASCADE"  lcdb
CREATE EXTENSION
#   ./pgedge pgbin 16 "psql -q -c \"CREATE EXTENSION snowflake\" lcdb"

May 06, 2025, 13:57:12: 127.0.0.1 : n1 - Setting up pgEdge on n1                                   [OK]
May 06, 2025, 13:57:12: 127.0.0.1 : n1 - Creating DB 'lcdb' (if missing) on node 'n1'              
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge db create -User lcusr -db lcdb -Passwd password --Port=6432" 

May 06, 2025, 13:57:20: 127.0.0.1 : n1 - Creating DB 'lcdb' (if missing) on node 'n1'              [IGNORED]
May 06, 2025, 13:57:20: 127.0.0.1 : n1 - Configuring Spock GUCs on node 'n1'                       
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge db guc-set spock.enable_ddl_replication on; /home/ec2-user/demo/n1/pgedge/pgedge db guc-set spock.include_ddl_repset on; /home/ec2-user/demo/n1/pgedge/pgedge db guc-set spock.allow_ddl_from_functions on;" 

May 06, 2025, 13:57:24: 127.0.0.1 : n1 - Configuring Spock GUCs on node 'n1'                       [OK]
```

After installing pgEdge on each node, the CLI configures replication on each node:

```
## Configuring Spock replication on all nodes
May 06, 2025, 13:59:04: 127.0.0.1 : n1 - Creating node n1                                          
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge spock node-create n1 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6432' lcdb" 

[
  {
    "node_create": 49708
  }
]
 pg_reload_conf 
----------------
 t
(1 row)

Set GUC snowflake.node to 1

May 06, 2025, 13:59:06: 127.0.0.1 : n1 - Creating node n1                                          [OK]
May 06, 2025, 13:59:06: 127.0.0.1 : n2 - Creating node n2                                          
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n2/pgedge/pgedge spock node-create n2 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6433' lcdb" 

[
  {
    "node_create": 26863
  }
]
 pg_reload_conf 
----------------
 t
(1 row)

Set GUC snowflake.node to 2

May 06, 2025, 13:59:08: 127.0.0.1 : n2 - Creating node n2                                          [OK]
May 06, 2025, 13:59:08: 127.0.0.1 : n3 - Creating node n3                                          
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n3/pgedge/pgedge spock node-create n3 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6434' lcdb" 

[
  {
    "node_create": 9057
  }
]
 pg_reload_conf 
----------------
 t
(1 row)

Set GUC snowflake.node to 3


May 06, 2025, 13:59:10: 127.0.0.1 : n3 - Creating node n3                                          [OK]
May 06, 2025, 13:59:10: 127.0.0.1 : n1 - Creating subscriptions sub_n1n2                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge spock sub-create sub_n1n2 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6433' lcdb" 

[
  {
    "sub_create": 3293941396
  }
]

May 06, 2025, 13:59:11: 127.0.0.1 : n1 - Creating subscriptions sub_n1n2                           [OK]
May 06, 2025, 13:59:11: 127.0.0.1 : n1 - Creating subscriptions sub_n1n3                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n1/pgedge/pgedge spock sub-create sub_n1n3 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6434' lcdb" 

[
  {
    "sub_create": 1919895280
  }
]

May 06, 2025, 13:59:12: 127.0.0.1 : n1 - Creating subscriptions sub_n1n3                           [OK]
May 06, 2025, 13:59:12: 127.0.0.1 : n2 - Creating subscriptions sub_n2n1                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n2/pgedge/pgedge spock sub-create sub_n2n1 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6432' lcdb" 

[
  {
    "sub_create": 3651191944
  }
]

May 06, 2025, 13:59:13: 127.0.0.1 : n2 - Creating subscriptions sub_n2n1                           [OK]
May 06, 2025, 13:59:13: 127.0.0.1 : n2 - Creating subscriptions sub_n2n3                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n2/pgedge/pgedge spock sub-create sub_n2n3 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6434' lcdb" 

[
  {
    "sub_create": 923363493
  }
]

May 06, 2025, 13:59:14: 127.0.0.1 : n2 - Creating subscriptions sub_n2n3                           [OK]
May 06, 2025, 13:59:14: 127.0.0.1 : n3 - Creating subscriptions sub_n3n1                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n3/pgedge/pgedge spock sub-create sub_n3n1 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6432' lcdb" 

[
  {
    "sub_create": 2615912954
  }
]

May 06, 2025, 13:59:15: 127.0.0.1 : n3 - Creating subscriptions sub_n3n1                           [OK]
May 06, 2025, 13:59:15: 127.0.0.1 : n3 - Creating subscriptions sub_n3n2                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n3/pgedge/pgedge spock sub-create sub_n3n2 'host=127.0.0.1 user=ec2-user dbname=lcdb port=6433' lcdb" 

[
  {
    "sub_create": 1118534372
  }
]

May 06, 2025, 13:59:16: 127.0.0.1 : n3 - Creating subscriptions sub_n3n2                           [OK]
May 06, 2025, 13:59:16: 127.0.0.1 : n3 - Listing spock nodes                                       
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "/home/ec2-user/demo/n3/pgedge/pgedge spock node-list lcdb" 

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
  }
]

May 06, 2025, 13:59:17: 127.0.0.1 : n3 - Listing spock nodes                                       [OK]

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
  }
]

```

If you provided pgBackRest details in the cluster_name.json file, the installer adds pgBackRest to your cluster:

```
## Integrating pgBackRest into the cluster
### Configuring pgBackRest for node 'n1'
May 06, 2025, 13:59:17: 127.0.0.1 : n1 - Installing pgBackRest                                     
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge install backrest" 

########### Installing backrest ###############
  ['backrest']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO/stable/0501 backrest-2.53.1-1-arm

Unpacking backrest-2.53.1-1-arm.tgz
/var/lib/pgbackrest directory already exists
##### Configuring pgbackrest #####
pgBackRest 2.53.1

May 06, 2025, 13:59:20: 127.0.0.1 : n1 - Installing pgBackRest                                     [OK]
May 06, 2025, 13:59:20: 127.0.0.1 : n1 - Modifying postgresql.conf for pgBackRest                  
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge backrest set_postgresqlconf --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-path /var/lib/pgbackrest/n1 --repo1-type posix" 

#   /home/ec2-user/demo/n1/pgedge/backrest/backrest.py set_postgresqlconf --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-path /var/lib/pgbackrest/n1 --repo1-type posix
  new: archive_command = 'pgbackrest --stanza=demo_stanza_n1 --pg1-path=/home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-type=posix --repo1-path=/var/lib/pgbackrest/n1 --repo1-cipher-type=aes-256-cbc archive-push %p'
  new: archive_mode = 'on'


May 06, 2025, 13:59:21: 127.0.0.1 : n1 - Modifying postgresql.conf for pgBackRest                  [OK]
May 06, 2025, 13:59:21: 127.0.0.1 : n1 - Modifying pg_hba.conf for pgBackRest                      
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge backrest set_hbaconf" 

#   /home/ec2-user/demo/n1/pgedge/backrest/backrest.py set_hbaconf


May 06, 2025, 13:59:22: 127.0.0.1 : n1 - Modifying pg_hba.conf for pgBackRest                      [OK]
May 06, 2025, 13:59:22: 127.0.0.1 : n1 - Reloading PostgreSQL configuration                        
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge psql 'select pg_reload_conf()' lcdb" 

 pg_reload_conf 
----------------
 t
(1 row)

May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Reloading PostgreSQL configuration                        [OK]
May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Setting BACKUP stanza 'demo_stanza_n1' on node 'n1'       
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP stanza demo_stanza_n1" 

May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Setting BACKUP stanza 'demo_stanza_n1' on node 'n1'       [OK]
May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Creating restore directory /var/lib/pgbackrest_restore/n1 
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "sudo mkdir -p /var/lib/pgbackrest_restore/n1" 

May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Creating restore directory /var/lib/pgbackrest_restore/n1 [OK]
May 06, 2025, 13:59:23: 127.0.0.1 : n1 - Setting BACKUP restore_path to /var/lib/pgbackrest_restore/n1
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP restore_path /var/lib/pgbackrest_restore/n1" 

May 06, 2025, 13:59:24: 127.0.0.1 : n1 - Setting BACKUP restore_path to /var/lib/pgbackrest_restore/n1[OK]
May 06, 2025, 13:59:24: 127.0.0.1 : n1 - Setting BACKUP repo1-host-user to ec2-user on node 'n1'   
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP repo1-host-user ec2-user" 

May 06, 2025, 13:59:25: 127.0.0.1 : n1 - Setting BACKUP repo1-host-user to ec2-user on node 'n1'   [OK]
May 06, 2025, 13:59:25: 127.0.0.1 : n1 - Setting BACKUP pg1-path to /home/ec2-user/demo/n1/pgedge/data/pg16 on node 'n1'
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16" 

May 06, 2025, 13:59:25: 127.0.0.1 : n1 - Setting BACKUP pg1-path to /home/ec2-user/demo/n1/pgedge/data/pg16 on node 'n1'[OK]
May 06, 2025, 13:59:25: 127.0.0.1 : n1 - Setting BACKUP pg1-user to ec2-user on node 'n1'          
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP pg1-user ec2-user" 

May 06, 2025, 13:59:26: 127.0.0.1 : n1 - Setting BACKUP pg1-user to ec2-user on node 'n1'          [OK]
May 06, 2025, 13:59:26: 127.0.0.1 : n1 - Setting BACKUP pg1-port to 6432 on node 'n1'              
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP pg1-port 6432" 

May 06, 2025, 13:59:26: 127.0.0.1 : n1 - Setting BACKUP pg1-port to 6432 on node 'n1'              [OK]
May 06, 2025, 13:59:26: 127.0.0.1 : n1 - Creating pgBackRest stanza 'demo_stanza_n1'               
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge backrest command stanza-create --stanza 'demo_stanza_n1' --pg1-path '/home/ec2-user/demo/n1/pgedge/data/pg16' --repo1-cipher-type aes-256-cbc --pg1-port 6432 --repo1-path /var/lib/pgbackrest/n1" 

#   /home/ec2-user/demo/n1/pgedge/backrest/backrest.py command stanza-create --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-cipher-type aes-256-cbc --pg1-port 6432 --repo1-path /var/lib/pgbackrest/n1
Full command to be executed:
 pgbackrest stanza-create --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-cipher-type aes-256-cbc --pg1-port 6432 --repo1-path /var/lib/pgbackrest/n1
Command executed successfully.

May 06, 2025, 13:59:28: 127.0.0.1 : n1 - Creating pgBackRest stanza 'demo_stanza_n1'               [OK]
May 06, 2025, 13:59:28: 127.0.0.1 : n1 - Creating full pgBackRest backup                           
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge backrest command backup '--repo1-path /var/lib/pgbackrest/n1 --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-type posix --log-level-console info --pg1-port 6432 --db-socket-path /tmp --repo1-cipher-type aes-256-cbc --repo1-retention-full 7 --type=full'" 

#   /home/ec2-user/demo/n1/pgedge/backrest/backrest.py command backup --repo1-path /var/lib/pgbackrest/n1 --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-type posix --log-level-console info --pg1-port 6432 --db-socket-path /tmp --repo1-cipher-type aes-256-cbc --repo1-retention-full 7 --type=full
Full command to be executed:
 pgbackrest backup --repo1-path /var/lib/pgbackrest/n1 --stanza demo_stanza_n1 --pg1-path /home/ec2-user/demo/n1/pgedge/data/pg16 --repo1-type posix --log-level-console info --pg1-port 6432 --db-socket-path /tmp --repo1-cipher-type aes-256-cbc --repo1-retention-full 7 --type full
Command executed successfully.
2025-05-06 13:59:28.809 P00   INFO: backup command begin 2.53.1: --exec-id=1185460-3874f829 --log-level-console=info --pg1-path=/home/ec2-user/demo/n1/pgedge/data/pg16 --pg1-port=6432 --pg1-socket-path=/tmp --repo1-cipher-pass=<redacted> --repo1-cipher-type=aes-256-cbc --repo1-path=/var/lib/pgbackrest/n1 --repo1-retention-full=7 --repo1-type=posix --stanza=demo_stanza_n1 --type=full
2025-05-06 13:59:29.414 P00

May 06, 2025, 13:59:29: 127.0.0.1 : n1 - Creating full pgBackRest backup                           [OK]
May 06, 2025, 13:59:29: 127.0.0.1 : n1 - Setting BACKUP repo1-path to /var/lib/pgbackrest/n1 on node 'n1'
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge set BACKUP repo1-path /var/lib/pgbackrest/n1" 

May 06, 2025, 13:59:30: 127.0.0.1 : n1 - Setting BACKUP repo1-path to /var/lib/pgbackrest/n1 on node 'n1'[OK]
May 06, 2025, 13:59:30: 127.0.0.1 : n1 - Generating pgBackrest YAML                                
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n1/pgedge && ./pgedge backrest write-config" 

May 06, 2025, 13:59:30: 127.0.0.1 : n1 - Generating pgBackrest YAML                                [OK]
May 06, 2025, 13:59:30: 127.0.0.1 : n2 - Generating pgBackrest YAML                                
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n2/pgedge && ./pgedge backrest write-config" 

May 06, 2025, 13:59:31: 127.0.0.1 : n2 - Generating pgBackrest YAML                                [OK]
May 06, 2025, 13:59:31: 127.0.0.1 : n3 - Generating pgBackrest YAML                                
  ssh -o StrictHostKeyChecking=no -q -t ec2-user@127.0.0.1 "cd /home/ec2-user/demo/n3/pgedge && ./pgedge backrest write-config" 

May 06, 2025, 13:59:32: 127.0.0.1 : n3 - Generating pgBackrest YAML                                [OK]
```

