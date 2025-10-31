# Migrating from Community Postgres to pgEdge Enterprise Postgres

The steps required to make the move from community Postgres to pgEdge Postgres will vary based on your current installation, the current version, and installation details. 

!!! info

    Before starting a migration or upgrade, ensure that you have a recent backup in case you need to revert to your previous version.

The following sections provide sample commands; please note that commands may vary depending on your system and configuration.

## Migrating Between the Same Postgres Versions

If your current Postgres version is the same as your target Postgres version, you can simply switch repositories and perform an upgrade; the `data` directories are compatible:

1. Install and [configure the `pgedge` repository](/configure-repo.md).

2. Stop any already running Postgres cluster with the command:

    `sudo pg_ctlcluster 18 main stop`

3. Now you are ready to replace the community Postgres packages with the `pgedge-enterprise-postgres-18` packages; invoke the following command:
    
    `sudo apt-get install pgedge-enterprise-postgres-18`

4. After replacing the community installation you can safely start the cluster again with the following command:
    
    `sudo pg_ctlcluster 18 main start`

5. You can use the psql client to test the running cluster:

    ```sql
    postgres@ip-172-31-26-98:~$ psql 
    psql (18.0 (Ubuntu 18.0-1.jammy))
    Type "help" for help.

    postgres=# select version();
                                                               version                                                               
    -------------------------------------------------------------------------------------------------------------------------------------
     PostgreSQL 18.0 (Ubuntu 18.0-1.jammy) on aarch64-unknown-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04.2) 11.4.0, 64-bit
    (1 row)
    ```


## Performing a Major Version Upgrade to pgEdge Enterprise Postgres

To perform a migration from an older major version of community Postgres to a more recent major version of pgEdge Enterprise Postgres, you will need to use [pg_upgrade](https://www.postgresql.org/docs/current/pgupgrade.html). 

The example that follows will walk you through an upgrade from community Postgres version 17 to pgEdge Enterprise Postgres version 18; the following is a high-level overview of the steps required:

1. Install and [configure the pgedge repository](/configure-repo.md).

2. Next, install the `pgedge-enterprise-postgres-18` packages; use the following command:

    `sudo apt-get install pgedge-enterprise-postgres-18`

3. Create and start a pgEdge Enterprise Postgres cluster:

    ```sql
    sudo pg_createcluster 18 main -- --locale=C.UTF-8 --encoding=UTF8
    sudo pg_ctlcluster 18 main start
    ```

4. Next, you'll use pg_upgrade to migrate from Postgres 17 to pgEdge Enterprise Postgres 18. Invoke the new version of the pg_upgrade utility (the version located in the newly created `/usr/pgsql-18/bin directory`) to migrate your Postgres installation. For example, the following command converts a version 17 installation to a version 18 installation:

    ```sql
    /usr/lib/postgresql/18/bin/pg_upgrade \
    --old-datadir=/var/lib/postgresql/17/main \
    --new-datadir=/var/lib/postgresql/18/main \
    --old-bindir=/usr/lib/postgresql/17/bin \
    --new-bindir=/usr/lib/postgresql/18/bin \
    --username=postgres \
    --check
    ```
    
    !!! hint

        Include the `--check` option to perform a test upgrade before invoking the command without `--check` to perform the actual upgrade.

5. When the upgrade completes, restart the server with the command:

    `sudo systemctl restart postgresql@18-main`

6. Then, adjust your PATH to point to the new version of Postgres; for example:

    ```bash
    echo 'export PATH=/usr/lib/postgresql/18/bin:$PATH' >> ~/.bashrc
    . ~/.bashrc
    ```