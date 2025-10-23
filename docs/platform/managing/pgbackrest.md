# Using pgBackRest for Backup and Restore

pgBackRest is a reliable, easy-to-use backup and restore solution that can seamlessly scale up to the largest databases and workloads by using algorithms that are optimized for database-specific requirements. pgEdge Distributed Postgres (VM Edition) installers can configure pgBackRest [when you initialize a cluster](../installing_pgedge/cluster_deploy.md), or you can install pgBackRest as a [supported component](../managing/supported_extensions.md) in an existing cluster.

!!! info

    To ensure that backups are running as expected, we recommend monitoring the pgBackRest logs. By default, log files are stored in the `/var/log/pgbackrest` directory.

## Configuring a pgBackRest Storage Environment

The command-line interface (CLI) supports deploying a new cluster with pgBackRest backups stored in either a Posix-compliant file system or an AWS S3 bucket.

* **Posix-compliant file system.**  If you are storing your pgBackRest repository on a file system, we recommend using a network file share if possible.  This allows the CLI to leverage the repository from the source node when initializing the target node in an add node operation.

* **An AWS S3 Bucket.**  If you're using an AWS S3 bucket for your backups, add the following lines to the `~/.bashrc` file on each node of the cluster to allow the node to access your bucket:

```sh
export PGBACKREST_REPO1_S3_KEY=AIYFYUHQWTUJVLPPE
export PGBACKREST_REPO1_S3_BUCKET=bucket-8765t3xpf
export PGBACKREST_REPO1_S3_KEY_SECRET=G9tloTwj2+y4TKLO3qMjeK3G9a7GkR4mo
export PGBACKREST_REPO1_S3_ENDPOINT=s3.amazonaws.com
export PGBACKREST_REPO1_S3_REGION=eu-west-2
```

If you are using encryption in your `repo1_cipher_type` configuration, you'll need to [generate a cipher pass](https://www.percona.com/blog/enhancing-postgresql-security-how-to-encrypt-the-pgbackrest-repository/) and add it to your `~/.bashrc` file on each node to set the cipher pass for encryption / decryption:

```sh
export PGBACKREST_REPO1_CIPHER_PASS=your_cipher_pass_here
```
Adding a cipher pass to your environment will also allow you to use pgBackRest management commands.

!!! info

    `PGBACKREST_REPO1_S3_KEY` and `PGBACKREST_REPO1_S3_KEY_SECRET` are not required if you wish to use the built-in credential chain using instance roles on AWS Virtual Machines.

### Configuring pgBackRest when you Deploy a Cluster

The CLI `cluster` module makes it easy to [define](../installing_pgedge/json.md) and [deploy](../installing_pgedge/json.md#using-the-cluster-module-to-deploy-a-cluster) a cluster that contains an initialized Postgres server, a running Spock installation, and a configured pgBackRest deployment.

After meeting the [prerequisites](../prerequisites/index.md), navigate into the installation directory, and enter:

```
./pgedge cluster json-create cluster_name node_count db_name db_superuser password --port=port_number --pg_ver=pg_version
```

This command will invoke the file creation wizard which will in turn, prompt you for cluster details. When the wizard finishes, the CLI creates a file named `cluster_name.json` in the `cluster` directory under your installation directory.

!!! help

    For detailed information about creating and using the `cluster_name.json` file and command options, visit [here](../installing_pgedge/json.md).  You can also access online help by entering `pgedge cluster json-create --help` from the command line when in the installation directory.

Then, you can use the `cluster init` command to deploy the defined cluster: 

```
./pgedge cluster init cluster_name
```

The command deploys the cluster with a running Postgres instance, installed and configured Spock extension, and initialized pgBackRest stanza.  When pgBackRest is configured for a given node, it will have the pgBackRest will take an initial backup and store it in the repository defined in the `cluster_name.json` file. 

!!! help

    For detailed information about creating and using the `cluster init` command, visit [here](../installing_pgedge/cluster_deploy.md).  You can also access online help by entering `pgedge cluster init --help` from the command line when in the installation directory.

### Configuring pgBackRest on an Existing Cluster

!!! info

If you have an existing pgEdge Distributed Postgres cluster, and wish to use pgBackRest as a backup solution, you can use the CLI to [install pgBackRest](./supported_extensions.md); when the installation completes, follow the configuration instructions at the [pgBackRest site](https://pgbackrest.org/user-guide.html) to configure your system.

If you have manually deployed pgBackRest on an existing cluster, you are not required to modify the configuration file to include pgBackRest configuration information. The cluster configuration file is required for other cluster management activities, and keeping the information together and up to date may be useful if you plan to:

* add a node to a cluster.
* remove a node from a cluster.
* invoke commands in the ACE module.

If you are manually adding pgBackRest deployment details to the `cluster.json` file, you should add:

- **backrest.stanza**: The name of the stanza to be used.
- **backrest.repo1_path**: The path to the repository used for backups.
- **backrest.repo1_retention_full**: The number of full backups to retain.
- **backrest.log_level_console**: The log level for console output.
- **backrest.repo1_cipher_type**: The type of encryption to use for the repository. Options are `aes-256-cbc` or `none`
- **backrest.archive_mode**: The mode for archiving WAL (Write-Ahead Logging) files (`on` / `off`). If set to `on`, archiving will be configured.
- **backrest.repo1_type**: The type of repository storage. The CLI currently supports `s3` and `posix`.

For detailed information about the `cluster.json` file, visit [here](../installing_pgedge/json.md).

### Scheduling pgBackRest Backups

The CLI does not directly provide any scheduling features for pgBackRest backups. To schedule backups using pgBackRest, you can use a cron job. [Cron](https://docs.gitlab.com/topics/cron/) is a time-based job scheduler in Unix-like operating systems.

The following steps outline scheduling a cron job for pgBackRest:

1. Open the `crontab` file for editing:
    ```sh
    crontab -e
    ```

2. Add a new line to the file that describes the backup. For example, to schedule a full backup every day at 2 AM, add the following line:
    ```sh
    0 2 * * * LD_LIBRARY_PATH=/home/pgedge/<cluster_name>/<node_name>/pgedge/pg<version>/lib pgbackrest --config <path_to_pgbackrest_config> --stanza=default_stanza_n1 --type=full backup
    ```

3. Save and close the `crontab` file.

!!! info 

    If cron is not available on your system, you can use any other scheduling or orchestration mechanism that can invoke pgBackRest in a similar way.

## Restoring with pgBackRest

pgBackRest provides mechanisms for restoring a Postgres database to a specific backup, or to a specific point in time. You should consult the [pgBackRest user guide](https://pgbackrest.org/user-guide.html) to become familiar with supported backup and restoration strategies.

Every database should have a different (pre-planned) disaster recovery scenario, dependent on many factors. When moving to a cluster that uses pgBackRest, you may want to adjust your approach, customizing the pgBackRest configuration accordingly, as you test and verify your disaster recovery plan.

Restoring a cluster should be considered a last resort. If nodes are still available, but have become out of sync due to inconsistent updates, consider using the Active Consistency Engine (ACE) to resolve discrepancies between nodes. 

The following steps outline using pgBackRest to restore a specific node:

1. Stop the CLI across all nodes; from the `pgedge` directory where you deployed your cluster, invoke the command:

    ```sh
    ./pgedge cluster command cluster_name all stop
    ```

2. Connect to the node you wish to restore, and navigate to the directory where the CLI is installed. By default, this is `/home/pgedge/<cluster_name>/<node_name>/pgedge` for nodes deployed with the `cluster` module.

3. Ensure that shared libraries required by pgBackRest are available in `LD_LIBRARY_PATH`:

    ```sh
    export LD_LIBRARY_PATH=/home/pgedge/<cluster_name>/<node_name>/pgedge/pg16/lib/
    ```

4. Use the pgBackRest `info` command to identify the backup you wish to restore. The default name of your configuration file is stored in the `pgbackrest:stanza` property of your cluster configuration file (`/pgedge/cluster/cluster_name/cluster_name.json`), with `.yaml` appended. Specify the complete path to the file, followed by the file name:
   
    ```sh
    pgbackrest info --config=path_to_configuration_file/configuration_file.yaml
    ```
 
For example, for a node named `n1` in a cluster named `demo`, the configuration file is stored in `/home/ec2-user/demo/n1/pgedge/backrest/demo_stanza_n1.yaml`. The complete `pgbackrest info` command and result is:

    ```sh
    pgbackrest info --config=/home/ec2-user/demo/n1/pgedge/backrest/demo_stanza_n1.yaml

    status: ok
    cipher: aes-256-cbc

    db (current)
        wal archive min/max (16): 000000010000000000000001/000000010000000000000002

        full backup: 20250530-125414F
            timestamp start/stop: 2025-05-30 12:54:14+00 / 2025-05-30 12:54:42+00
            wal start/stop: 000000010000000000000002 / 000000010000000000000002
            database size: 30MB, database backup size: 30MB
            repo1: backup set size: 4.0MB, backup size: 4.0MB
    ```

5. Invoke the pgBackRest `restore` command, specifying the backup ID with the `--set` option. In the output above, the backup id follows the `full backup:` label.  To restore a specific backup, use the command:

    ```sh
    pgbackrest restore --config=path_to_configuration_file/configuration_file.yaml --set=<backup_id> --stanza=default_stanza_n1 --delta --archive-mode=off
    ```
    For example, the following command restores backup ID `20250530-125414F` into a node named `n1` in a cluster named `demo`:
    
    ```sh
    pgbackrest restore --config=/home/ec2-user/demo/n1/pgedge/backrest/demo_stanza_n1.yaml --set=20250530-125414F --stanza=demo_stanza_n1 --delta --archive-mode=off
    
    INFO: restore command begin 2.53.1: --archive-mode=off --config=/home/ec2-user/demo/n1/pgedge/backrest/demo_stanza_n1.yaml --delta --exec-id=61790-4f1fd333 --log-level-console=info --pg1-path=/home/ec2-user/demo/n1/pgedge/data/pg16 --process-max=3 --repo1-cipher-pass=<redacted> --repo1-cipher-type=aes-256-cbc --repo1-path=/var/lib/pgbackrest/n1 --repo1-type=posix --set=20250530-125414F --stanza=demo_stanza_n1
    INFO: repo1: restore backup set 20250530-125414F, recovery will start at 2025-05-30 12:54:14
    INFO: remove invalid files/links/paths from '/home/ec2-user/demo/n1/pgedge/data/pg16'
    INFO: write updated /home/ec2-user/demo/n1/pgedge/data/pg16/postgresql.auto.conf
    INFO: restore global/pg_control (performed last to ensure aborted restores cannot be started)
    INFO: restore size = 30MB, file total = 1330
    INFO: restore command end: completed successfully (469ms)
    ```

!!! warning

    There is currently a known issue with the pgBackRest configuration file in clusters deployed automatically with the `cluster` module.  If you encounter the following error:

    ERROR: [072]: restore command must be run on the Postgres host

    Modify the configuration file, commenting out the line that sets the host address and retry your restore.

6. Then, start the service on the node you are restoring:

    ```sh
    ./pgedge start
    ```

   After restarting the service, we recommend monitoring the Postgres log to ensure that the database recovers to the desired state. If the recovery is not successful, you may need to adjust the restore options and run the restore again. You may also see errors as Spock tries to connect to other nodes based on the configured subscriptions - this is expected at this point.

   In many cases, you will be able to re-use the existing pgBackRest stanza and repository path from the same node, but you may be required to establish a new backup repository.  To establish a new repository path, update the pgBackRest configuration file, setting a new `repo1-path`, and adjusting other values as-needed.

!!! info

    You may want to save the existing repository (rather than overwriting it with new backups) in case you need to perform another restore during your recovery process.

1. To re-enable archiving, connect to your node and unset the `restore_command` that was created by pgBackRest:

    ```sql
    ALTER SYSTEM SET restore_command TO '';
    ALTER SYSTEM SET archive_mode = 'on';
    ```

2.  Restart the CLI to apply the changes:

    ```sh
    ./pgedge restart
    ```

3.  Confirm the [`archive_command`](https://www.postgresql.org/docs/17/continuous-archiving.html#BACKUP-ARCHIVING-WAL) reflects the changes; you can inspect the `archive_command` value with psql:

    ```psql
    SHOW archive_command;
    ```

    If necessary, update the `archive_command` to set any parameters which you have changed, or point to your pgBackRest configuration file:

    ```psql
    ALTER SYSTEM SET archive_command TO '<updated_command>';
    ```

    This ensures that the database is fully backed up and archiving is re-enabled for your WAL files.

At this point, your node should be restored to your desired state, and backing up again properly with pgBackRest. 

In a disaster recovery scenario, you can recover a cluster by restoring one node to a specific backup or point in time via this method, and rebuild the cluster using the `remove-node` and `add-node` functions in the `cluster` module. If you are not using the `cluster` module, you may need to rebuild the Spock configuration using the CLI or Spock SQL functions to re-establish replication between the nodes.

