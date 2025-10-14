# Reviewing Cluster Log Files

pgEdge Distributed Postgres maintains log files you can review for transactional details from your database cluster, while Spock provides functions and tables you can query for cluster configuration and status details.

## Accessing Log Files

CLI and Postgres log files are located in the `pgedge/cluster_name/node_name/pgedge/data/logs` directory under each node's installation:

* CLI logs are stored in a file named `cli_log.out`. A log file is maintained for each node of the cluster.
* Postgres server logs are stored in the `pgedge/cluster_name/node_name/pgedge/data/logs/pgxx` subdirectory. If you have installed more than one version of Postgres, you'll find a unique directory for each server. You can use the settings in the `postgresql.conf` file to control the content saved, the file rotation schedule, and other logged information.

The installer may modify the settings of the following Postgres logging-related parameters:

| Name | Value |
---------------------|----------------------------|
| `log_destination` | `csvlog, stderr` |
| `log_directory` | `/opt/pgedge/data/logs/pg17` |
| `log_filename` | `postgresql-%a.log` |
| `log_file_mode` | `0600` |
| `log_rotation_size` | `1GB` |
| `log_min_messages` | `warning` |
| `log_min_error_statement` | `error` |
| `log_connections` | `on` |
| `log_disconnections` | `on` |
| `log_error_verbosity` | `verbose` |
| `log_line_prefix` | `%t` [`%p`]: [`%l-1`] `user=%u,db=%d,app=%a,client=%h` |
| `log_statement` | `ddl` |
| `log_temp_files` | `1024` |
| `log_autovacuum_min_duration` | `0` |
| `logging_collector` | `on` |
| `log_checkpoints` | `on` |
| `log_min_duration_statement` | `1000` |
| `log_truncate_on_rotation` | `on` |

## Reviewing Information about your Cluster

Information about your cluster is stored in the `spock` schema.  You can retreive information about your configuration by querying the `spock` schema, or by invoking the following CLI commands at the command line.

The CLI is the command line interface installed with pgEdge Distributed Postgres. When you invoke CLI commands, ensure that you are in the `pgedge` directory, or that 
the installation directory is in your path.

**Finding the Installed Version**

To find your installed version, use the command:

`./pgedge info`

```sh
################################################################################
#     Version: pgEdge 25.0.0
# User & Host: ec2-user  ip-172-31-19-120.ec2.internal  /home/ec2-user/pgedge/cluster/demo/n1/pgedge
#          OS: Red Hat Enterprise Linux9.4 (Plow), glibc-2.34, Python 3.9.21 (py3.9-arm)
#     Machine: 7 GB, vCPU 2, Neoverse-N1
#  Cloud Info: aws  ec2  i-03f76bd5e8ba60184  t4g.large  us-east-1b
#    Repo URL: https://pgedge-download.s3.amazonaws.com/REPO
# Last Update: 2025-06-02 15:18:13
################################################################################
```

**Locating the Postgres data Directory**

You can use the CLI or psql to find your data directory.  From the CLI, enter:

`./pgedge db guc-show data_directory`

From the psql command line, use the command:

`show data_directory;`


**Listing Replication Nodes**
To list the nodes in your replication scenario, use the [`spock node-list`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-node-list)command; provide the database name when you invoke the command:

`./pgedge spock node-list database_name`

**Listing Tables**     
To list the tables in your replication set, use the [`repset-list-tables`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-repset-list-tables) command; provide the schema name and the database name when you invoke the command:

`./pgedge spock repset-list-tables schema_name database_name`

**Displaying Subscription Status**
To display the subscription status, use the [`sub-show-status`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-sub-show-status) command; provide the subscription name and the database name when you invoke the command:

`./pgedge spock sub-show-status subscription_name database_name`
     
**Using Spock Schema Tables**
The following table describes tables that reside in the `spock` schema that you can query for information about the cluster. 

| Name | Description |
---------------------|----------------------------|
| `depend` | Internal use - for tracking dependencies between Spock objects. |
| `exception_log` | Records errors caused by replication conflicts or unhandled exceptions. |
| `exception_status` | Used by ACE to track exception handling status at transaction and per-row level. |
| `exception_status_detail` | Used by ACE to track exception handling status at transaction and per-row level. |
| `node` | This table contains information about your replication nodes.|
| `node_interface` | This table contains information about your defined node interfaces.|
| `local_node` | This table contains one row with information about the local node.|
| `local_sync_status` | Internal use - for tracking sync status of tables and subscriptions. |
| `replication_set` | This table contains information about the replication sets defined for your cluster. It contains the set definition, and four boolean columns that indicate the type of information that the set replicates: `replicate_insert`, `replicate_update`, `replicate_delete`, and `replicate_truncate`.|
| `replication_set_seq` | This table contains information about replication set sequences.|
| `replication_set_table` | This table contains information about the tables that are in any replication set.|
| `tables` | This table contains information about the tables in your database.|
| `pii` | This is an optional table in which you can define columns that contain personally identifiable information (pii). You can add information such as the schema, table, and column names and then use this table to createcolumn filters when adding tables to replication sets. |
| `queue` | Internal use - for tracking sync progress and DDL replication. |
| `sequence_state` | Tracks sequence states used by Spock; Snowflake sequences are preferred method of sequence management. |
| `subscription` | This table contains information about your cluster subscriptions.|
| `resolutions` | This table contains one row per resolution made on this node.|



