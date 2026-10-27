# Migrating from Community Postgres to pgEdge Enterprise Postgres

The steps required to make the move from community Postgres to pgEdge Postgres will vary based on your current installation, the current version, and installation details. 

!!! info

    Before starting a migration or upgrade, ensure that you have a recent backup in case you need to revert to your previous version.

The following sections provide sample commands; please note that commands may vary depending on your system and configuration.

## Migrating Between the Same Postgres Versions

If your current Postgres version is the same as your target Postgres version, you can simply switch repositories and perform an upgrade; the `data` directories are compatible:

1. Install and [configure the `pgedge` repository](configure-repo.md).

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
