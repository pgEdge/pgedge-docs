# Upgrading the Spock Extension

Upgrade paths for the Spock extension are different for a *minor version upgrade* than for a *major version upgrade*. During a minor version upgrade, the first numeric value in the Spock version stays the same (for example, version 4.0.2 changes to 4.0.10).  During a major version upgrade, the first numeric value in the Spock version advances (for example, version 4.0.10 changes to Spock 5.0).

* During a Minor version upgrade, cluster nodes do not need to be stopped.

* During a Major version upgrade, you must stop all cluster nodes for the duration of the update.

Before starting the upgrade to Spock 5.0, upgrade [to the latest version](#performing-a-minor-version-upgrade-with-the-cli) of Spock 4.0 (`4.0.10`).

!!! warning

    Before starting a major or minor version upgrade, make sure you have a current backup of your cluster.  The upgrade process is not reversible, but you can use a backup to restore a cluster to its previous state.

## Performing a Major Version Upgrade of Spock

If you are performing a major version upgrade of the Spock extension from 4.0.10 to Spock 5.0, you should plan the upgrade for a time that you can take the cluster offline and take fresh backups.  You should also confirm that your version of Postgres is compatible with Spock 5.0 (Postgres versions 15.13-2, 16.9-2, and 17.5-2 or later are supported).

During a major version upgrade, the Postgres server will be stopped on all cluster nodes.  Before starting a major version upgrade, you should: 

* ensure that you are using the most-recent version of Spock (currently 4.0.10).
* take a fresh back up your cluster.
* if enabled, disable automatic ddl updates (autoddl) with the commands:

    ```sql
    ALTER SYSTEM SET spock.enable_ddl_replication=off;
    ALTER SYSTEM SET spock.include_ddl_repset=off;
    ALTER SYSTEM SET spock.allow_ddl_from_functions=off;
    SELECT pg_reload_conf();
    ```
    
Then, on each node, confirm the node health with the following CLI commands:

    ```bash
    ./pgedge spock node-list database_name
    ./pgedge spock sub-show-status subscription_name database_name
    ```

After confirming that each node is `ACTIVE` and has minimal replication lag, you can continue with the upgrade:

1. Confirm that you are using the most-recent version of Spock (currently 4.0.10). You can check the installed Spock version with the command:

    `./pgedge um list` 

    If you are not running the most recent version, [perform a minor version upgrade](#performing-a-minor-version-upgrade-with-the-cli) to the most recent version available.

2. Ensure that you are using a supported version of Postgres; Spock 5.0 is supported on Postgres versions 15.13-2, 16.9-2, and 17.5-2 or later.  You can check the version with the command: 


    `./pgedge um list`

3. Take a fresh back up your cluster.

4. Then, to perform a major Spock version upgrade, invoke the following commands on each node.  First, stop each node with the command; all nodes in the cluster must be stopped before you install the new version of Spock:

    `./pgedge stop`

5. Then, install the new version of Spock:

    `./pgedge um install spock50`

  The CLI installs the upgrade and restarts the database server. When the installation has completed, you can confirm the installed version with the CLI command: 

    `./pgedge um list`

6. Then, use Update Manager to remove the old version of Spock; for example, the following command removes the latest version of Spock:

    `./pgedge um remove spock40`

   When the upgrade completes, you can confirm the replication health of your cluster with the commands:
      
    `./pgedge spock node-list database_name`
  
    `./pgedge spock sub-show-status subscription_name database_name`

   You can also check for replication lag with the command:

    `psql -d <db> -c "SELECT * FROM spock.lag_tracker;"` 

!!! note

    The upgrade process does not remove the underlying installed extension; it only deletes the associated files and configuration.

### Performing a Minor Version Upgrade with the CLI

You can use the CLI's [Upgrade Manager (UM) module](../pgedge_commands/um.md) to perform a minor version upgrade of Spock.  To upgrade the installed version of Spock, navigate into the `pgedge` directory and invoke the command:

`./pgedge um upgrade spockXX`

Where `XX` specifies the Spock version.

!!! info

    To use the CLI to review a list of available versions, use the command: `./pgedge um list`

## Restoring a Cluster

If an upgrade fails, you cannot roll back the upgrade, but you can restore to your most recent backup.  The following high-level steps outline the process:

1. Stop all of the nodes in your cluster with the command:
    
    `./pgedge stop`

2. Remove the Spock 5.0 package (if installed) on each node with the command:

    `./pgedge um remove spock50`

3. Restore the `data` directory on each node.

4. Reinstall the Spock 4.0 package on each node with the command:

    `./pgedge um install spock40`

5. [Drop](../pgedge_commands/doc/spock-sub-drop.md) and [re-create](../pgedge_commands/doc/spock-sub-create.md) the cluster's subscriptions.

6. Validate that replication is working as expected.

At this point, you can resume use of your cluster with the previous Spock version.  Be sure you resume your backup strategy until you have corrected any issues and can re-attempt the upgrade.

If you're a pgBackRest user, you'll find detailed information about [using pgBackRest](../managing/pgbackrest.mdx) and [restoring from pgBackRest here](../managing/pgbackrest.mdx#restoring-with-pgbackrest).

