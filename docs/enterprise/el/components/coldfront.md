# Installing and Configuring pgEdge ColdFront

This guide describes installing and configuring
[pgEdge ColdFront](https://docs.pgedge.com/coldfront/) on an Enterprise Linux
system with RPM packages from the `pgedge` repository. ColdFront keeps tables
in PostgreSQL and stores cold data in Apache Iceberg tables in an object store;
the Lakekeeper Iceberg REST catalog tracks those tables. The installation
covers pgEdge Enterprise Postgres, the ColdFront packages, and Lakekeeper.

!!! warning

    ColdFront is beta software under active development. Do not use ColdFront
    in production; interfaces, on-disk formats, and behavior may change without
    notice, and data loss is possible.

The ColdFront packages support PostgreSQL 16, 17, and 18. The examples in this
guide use PostgreSQL 18; for another major version, replace `18` in each
package name, path, and service name with that version.

Before you start, ensure that:

- the host runs version 9 or 10 of RHEL, Rocky Linux, AlmaLinux, or Oracle
  Linux on an x86_64 (amd64) or aarch64 (arm64) processor.
- you have `root` or `sudo` access on the host.
- the host has network access to the `pgedge` repository.

## Configuring the pgEdge Repository

The ColdFront packages come from the `pgedge` repository, which requires an
access certificate from pgEdge. Follow the steps in
[Configuring the Repository](../configure-repo.md) to install the
prerequisites, create the repository, and register your certificate. If the
host already uses the `pgedge` repository, continue with the next section.

## Installing pgEdge Enterprise Postgres

The ColdFront packages require the pgEdge build of PostgreSQL. If the host
already runs pgEdge Enterprise Postgres, continue with
[Installing the ColdFront Packages](#installing-the-coldfront-packages).

Use the following steps to install pgEdge Enterprise Postgres and start the
server:

1. Install pgEdge Enterprise Postgres. The package does not create a database
    cluster, so the following commands install the package, initialize the
    cluster, and then enable and start the service:

    ```bash
    sudo dnf install -y pgedge-enterprise-postgres_18
    sudo /usr/pgsql-18/bin/postgresql-18-setup initdb
    sudo systemctl enable --now postgresql-18
    ```

2. Confirm that the server is running before you continue. The following
    command displays the PostgreSQL version:

    ```bash
    sudo -u postgres psql -c "SELECT version();"
    ```

    !!! hint

        A connection error means that the server is not running; use the `sudo
        systemctl status postgresql-18` command to check the state of the
        service.

The [Installing Postgres](../installing.md) guide describes the pgEdge
Enterprise Postgres packages and the locations of the installed files.

## Installing the ColdFront Packages

pgEdge distributes ColdFront in three packages. The following table describes
the packages and the files that each package installs:

| Package | Description |
|---------|-------------|
| `pgedge-coldfront_18` | The `coldfront` PostgreSQL extension for PostgreSQL 18. The package depends on `pgedge-pg-duckdb_18` and `pgedge-coldfront-duckdb-extensions`, so the package manager installs pg_duckdb and the patched DuckDB extensions in `/usr/lib/pgedge/coldfront/duckdb-extensions` as well. |
| `pgedge-coldfront` | The `archiver`, `partitioner`, and `compactor` command-line tools in `/usr/bin`, which work with every supported PostgreSQL version. The package also creates a `coldfront` system user and installs an example deployment file in `/usr/share/doc/pgedge-coldfront/examples`. |
| `pgedge-lakekeeper` | The Lakekeeper Iceberg REST catalog in `/usr/bin/lakekeeper`, a `lakekeeper` system user, a `lakekeeper` systemd service, and the `/etc/lakekeeper/lakekeeper.env` environment file. |

Use the following steps to install the ColdFront packages:

1. Install the ColdFront extension package for your PostgreSQL major version.
    The following command installs the package for PostgreSQL 18:

    ```bash
    sudo dnf install -y pgedge-coldfront_18
    ```

2. Install the ColdFront command-line tools and Lakekeeper with the following
    command:

    ```bash
    sudo dnf install -y pgedge-coldfront pgedge-lakekeeper
    ```

!!! hint

    The pg_duckdb and DuckDB extension packages contain patched builds rather
    than the upstream releases; the builds include ColdFront's patches to
    duckdb-iceberg, pg_duckdb, and DuckDB. The
    [Understanding ColdFront's DuckDB Stack](https://docs.pgedge.com/coldfront/development/installation/#understanding-coldfronts-duckdb-stack)
    section of the ColdFront documentation describes each patch.

The `pgedge-lakekeeper` package installs Lakekeeper but does not configure or
start the service; you configure and start Lakekeeper in
[Installing and Configuring Lakekeeper](#installing-and-configuring-lakekeeper).

## Configuring PostgreSQL for ColdFront

The ColdFront packages do not configure PostgreSQL. The
[Configuring PostgreSQL](https://docs.pgedge.com/coldfront/development/configuration/#configuring-postgresql)
section of the ColdFront documentation describes each setting that the
following steps use, along with the optional tuning settings.

Use the following steps to configure PostgreSQL and create the extensions:

1. Add the following settings to the `postgresql.conf` file in the
    `/var/lib/pgsql/18/data/` directory:

    ```ini
    shared_preload_libraries = 'pg_duckdb,coldfront'
    duckdb.extension_directory = '/usr/lib/pgedge/coldfront/duckdb-extensions'
    duckdb.allow_unsigned_extensions = true
    duckdb.autoinstall_known_extensions = false
    duckdb.postgres_role = 'coldfront_duckdb'
    coldfront.iceberg_async_parquet = on
    coldfront.iceberg_bakery_patch = on
    coldfront.warehouse = '<warehouse-name>'
    coldfront.lakekeeper_endpoint = 'http://<lakekeeper-host>:8181/catalog'
    coldfront.local_pg_dsn = 'host=/var/run/postgresql dbname=<db> user=<role>'
    ```

    Replace the placeholders as follows:

    - `<warehouse-name>` is the name of the Lakekeeper warehouse that you
      create when you bootstrap Lakekeeper; the ColdFront examples use `wh`.
    - `<lakekeeper-host>` is the host that runs Lakekeeper; use `localhost`
      when Lakekeeper runs on the same host.
    - `<db>` and `<role>` are the database and the role that DuckDB uses to
      read PostgreSQL tables on this server.

2. Restart PostgreSQL. The `CREATE EXTENSION coldfront` command fails on a
    server that does not preload the extension:

    ```bash
    sudo systemctl restart postgresql-18
    ```

3. Connect as the `postgres` superuser with `sudo -u postgres psql`, create the
    role that `duckdb.postgres_role` names, and create the extensions:

    ```sql
    CREATE ROLE coldfront_duckdb NOLOGIN;
    CREATE EXTENSION pg_duckdb;
    CREATE EXTENSION coldfront;
    ```

    You create the role once for the PostgreSQL server. Run the `CREATE
    EXTENSION` commands in each database that uses ColdFront.

## Installing and Configuring Lakekeeper

The `pgedge-lakekeeper` package installs the `lakekeeper` binary, a
`lakekeeper` system user, and a `lakekeeper` systemd service, but the package
does not configure, enable, or start the service. Lakekeeper stores its catalog
in a PostgreSQL 15 or later database and reads its settings from
`/etc/lakekeeper/lakekeeper.env`. The installed environment file contains each
setting as a comment; uncomment each setting that you change.

Use the following steps to install, configure, and start Lakekeeper:

1. If you did not install the `pgedge-lakekeeper` package with the ColdFront
    packages, install the package now with the following command:

    ```bash
    sudo dnf install -y pgedge-lakekeeper
    ```

2. Connect as a PostgreSQL superuser, such as `postgres` (for example, with
    `sudo -u postgres psql`), and create a role and a database for the catalog.
    Replace `<password>` with a generated password, such as the output of
    `openssl rand -hex 32`; a hex value needs no escaping in the connection
    string in step 3:

    ```sql
    CREATE ROLE lakekeeper LOGIN PASSWORD '<password>';
    CREATE DATABASE lakekeeper OWNER lakekeeper;
    ```

    !!! hint

        The migration in step 4 creates the `uuid-ossp`, `pgcrypto`, `pg_trgm`,
        `btree_gin`, and `btree_gist` extensions. Either allow the `lakekeeper`
        role to run `CREATE EXTENSION`, or create the extensions as a superuser
        before you run the migration.

3. In `/etc/lakekeeper/lakekeeper.env`, set the catalog database's connection
    string and an encryption key:

    ```bash
    LAKEKEEPER__PG_DATABASE_URL_WRITE=postgresql://lakekeeper:<password>@127.0.0.1:5432/lakekeeper
    LAKEKEEPER__PG_ENCRYPTION_KEY=<encryption-key>
    ```

    Before you save the file, make the following changes:

    - Replace `<password>` with the password from step 2, and adjust the host
      and port if the catalog database is on another server.
    - Replace `<encryption-key>` with a random secret, such as the output of
      `openssl rand -base64 32`. Lakekeeper encrypts stored credentials with
      the key, so keep the key stable and backed up. Every node that shares the
      catalog needs the same key.

4. Run the one-time database migration as the `lakekeeper` user. The command
    reads the environment file as that user, because the file is not readable
    by other accounts:

    ```bash
    sudo -u lakekeeper sh -c \
      'set -a; . /etc/lakekeeper/lakekeeper.env; set +a; exec /usr/bin/lakekeeper migrate'
    ```

5. Secure the listener before you start the service. By default, Lakekeeper
    listens on port 8181 on every address and, with no authorization backend,
    accepts every request. Do not start Lakekeeper with the default settings;
    instead, choose one of the following options:

    - If every client runs on the same host, add the following setting to
      `/etc/lakekeeper/lakekeeper.env`:

        ```bash
        LAKEKEEPER__BIND_IP=127.0.0.1
        ```

    - If clients connect from other hosts, configure
      [authentication](https://docs.lakekeeper.io/docs/latest/authentication/)
      and an enforcing
      [authorization](https://docs.lakekeeper.io/docs/latest/authorization/)
      backend, and limit access to port 8181 with a firewall.

6. Enable and start the service with the following command:

    ```bash
    sudo systemctl enable --now lakekeeper
    ```

## Completing the ColdFront Configuration

The rest of the ColdFront installation applies to each installation method;
consult the [ColdFront documentation](https://docs.pgedge.com/coldfront/development/)
for details. Use the following steps to finish the configuration:

1. Bootstrap Lakekeeper as described in
    [Bootstrapping Lakekeeper](https://docs.pgedge.com/coldfront/development/configure_lakekeeper/#bootstrapping-lakekeeper).
    For the SeaweedFS store, the same section creates the warehouse and the
    namespace. The warehouse name must match the `coldfront.warehouse` setting.

2. For any other object store, create the warehouse, the namespace, and the
    credential as described in your backend's section of
    [Configuring your Object Store](https://docs.pgedge.com/coldfront/development/object_store/).

3. Store the object store credential in each database that uses ColdFront, and
    grant access to application roles, as described in
    [Configuring PostgreSQL for Lakekeeper](https://docs.pgedge.com/coldfront/development/configure_lakekeeper/#configuring-postgresql-for-lakekeeper).

4. Write ColdFront's table configuration with the `archiver register` or
    `archiver import` command, as described in
    [Writing ColdFront's Configuration](https://docs.pgedge.com/coldfront/development/configuration/#writing-coldfronts-configuration).
    An import also writes the object store credential from the deployment file.
    The `pgedge-coldfront` package installs an example deployment file. Use the
    following command to copy the example to the current directory:

    ```bash
    cp /usr/share/doc/pgedge-coldfront/examples/config.example.yaml deploy.yaml
    ```

    Edit the copy for your deployment, and then use the following command to
    import the configuration:

    ```bash
    archiver import --config deploy.yaml
    ```

    A system configured to skip package documentation does not install the
    example file. The ColdFront repository includes the same
    [`config.example.yaml`](https://github.com/pgEdge/coldfront/blob/main/config.example.yaml)
    file.

For detailed information about using ColdFront, see
[Using ColdFront](https://docs.pgedge.com/coldfront/development/using_coldfront/).
