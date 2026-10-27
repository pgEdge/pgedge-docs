# Installing and Upgrading Spock

The `pgedge` repository provides Spock 5.0.13, the latest stable release of
Spock, for Postgres 16, 17, and 18, and the Postgres 19 release candidate.
Spock 6.0.0 is available as a beta release; the steps on this page install
Spock 5.0 and upgrade a cluster between Spock 5.0 releases. For Spock 6, see
the [Spock 6 documentation](https://docs.pgedge.com/spock-v6/).

Spock 5.0.13 runs on:

Ubuntu

  * Ubuntu 22.04 LTS and 24.04 LTS (AMD & ARM)

Debian

  * Debian 12 and 13 (AMD & ARM)

## Installing Spock

The `pgedge-enterprise-all-18` and `pgedge-enterprise-postgres-18`
packages include Spock; if you installed either package, Spock is already on
the host. To install Spock on its own for Postgres 18, use the command:

```bash
sudo apt-get install -y pgedge-postgresql-18-spock50
```

To enable Spock, add the following parameters to the end of the
`/etc/postgresql/18/main/postgresql.conf` file:

```ini
wal_level = logical
max_worker_processes = 10
max_replication_slots = 10
max_wal_senders = 10
shared_preload_libraries = 'spock'
track_commit_timestamp = on
```

If your server has the `output_plugin_libraries` parameter, also add
`spock_output` to that parameter:

```ini
output_plugin_libraries = 'pgoutput, test_decoding, spock_output'
```

Restart Postgres, and then create the extension in the database that Spock
will replicate:

```bash
sudo systemctl restart postgresql@18-main
sudo -u postgres psql -d database_name -c "CREATE EXTENSION spock;"
```

To create nodes and subscriptions and build a cluster, see the
[Spock documentation](https://docs.pgedge.com/spock-v5/).

## Upgrading Spock

Before performing an upgrade to a newer version of Spock, ensure you have a current backup of your system.

1. Before starting to upgrade individual nodes, disable Auto-DDL on all of the nodes in your cluster:

    ```sql
    ALTER SYSTEM SET spock.enable_ddl_replication = off;
    ALTER SYSTEM SET spock.include_ddl_repset = off;
    ALTER SYSTEM SET spock.allow_ddl_from_functions = off;
    SELECT pg_reload_conf();
    ```
    After stopping automatic DDL replication on all of the nodes in your cluster, update the Spock extension on each node.

2. Stop the Postgres Server:

    `sudo pg_ctlcluster <xx> main stop`

    or

    `pg_ctl -D /path/to/data stop -m fast`

3. Upgrade the Spock package using your package manager:

    `sudo apt-get update`

    `sudo apt-get upgrade pgedge-postgresql-<xx>-spock50`

    For example, to upgrade to the latest version supported on Postgres 17, use the command:

    `sudo apt-get upgrade pgedge-postgresql-17-spock50`

4. Start the Postgres server:

    `sudo pg_ctlcluster <xx> main start`

    or:

    `sudo systemctl start postgresql`

5. Connect with psql and check the version of the Spock Extension registered with Postgres:

    `SELECT extname, extversion FROM pg_extension WHERE extname = 'spock';`

    If the command does not return the latest Spock extension version, run the following commands:

    `ALTER EXTENSION spock UPDATE;`

    `SELECT extname, extversion FROM pg_extension WHERE extname = 'spock';`

6. Use psql to verify the node's replication status:

    ```sql
    SELECT sub_name, sub_enabled FROM spock.subscription;
    SELECT slot_name, active FROM pg_replication_slots;
    SELECT * FROM spock.node;
    ```

    When you've upgraded the Spock extension on all of the nodes in your cluster, enable Auto-DDL (as needed):

    ```sql
    ALTER SYSTEM SET spock.enable_ddl_replication = on;
    ALTER SYSTEM SET spock.include_ddl_repset = on;
    ALTER SYSTEM SET spock.allow_ddl_from_functions = on;
    SELECT pg_reload_conf();
    ```