# Upgrading Spock on a pgEdge Enterprise Postgres Installation

Spock 5.0.4 is supported on PG versions 16, 17, and 18, running on:

Ubuntu

  * Ubuntu 22.04 LTS and 24.04 LTS (AMD & ARM)

Debian

  * Debian 11, 12, and 13 (AMD & ARM)

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

    `ALTER EXTENSION spock UPDATE TO '5.0.4';`

    `SELECT extname, extversion FROM pg_extension WHERE extname = 'spock';`

6. Use psql to verify the node's replication status:

    ```sql
    SELECT sub_name, sub_enabled FROM spock.subscription;
    SELECT slot_name, active FROM pg_replication_slots;
    SELECT * FROM spock.node;
    ```

    When you've upgraded the Spock extension on all of the nodes in your cluster, enable Auto-DDL (as needed):

    ```sql
    SYSTEM SET spock.enable_ddl_replication = on;
    ALTER SYSTEM SET spock.include_ddl_repset = on;
    ALTER SYSTEM SET spock.allow_ddl_from_functions = on;
    SELECT pg_reload_conf();
    ```