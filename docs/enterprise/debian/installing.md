# Using pgEdge Enterprise Postgres Packages

After installing the `pgedge` repository, you're ready to create Postgres databases and install supporting components. If needed, modify the sample commands that follow to use your preferred package manager.

!!! info

    Installing Debian packages with pgEdge Enterprise Postgres (e.g., pgedge-postgresql-18 or related components) will remove any previously installed community Postgres packages (versions 12–18).  This behavior is consistent with community Postgres packages.  If you wish to keep your existing Postgres installation, install pgEdge Enterprise Postgres in a separate environment (such as a container or virtual machine).

To review a list of packages available from the `pgedge` repository, use the command:

  ```bash
  apt list | grep pgedge-*
  ```

To see a list of components installed by a specific package or version, use the command:

  `apt-cache depends pgedge-enterprise-postgres-18`

To install a package, you can use conventional syntax and options:

  `apt-get install package_name`

For example, to install only those packages required to set up a Postgres 18 database, use the command:

  `sudo apt-get install pgedge-enterprise-postgres-18`

**Installation File Locations and Details**

To find installation locations and files for your Postgres installation on a Debian host, invoke the commands in the table that follows:

| Location of Files | Command |
|-----------|----------|
| Postgres Version | `pg_config --version` |
| Cluster details | `pg_lsclusters` |
| `bin` directory location | `pg_config --bindir` |
| `pg_hba.conf` location | `pg_conftool 18 main show hba_file` |
| `doc` directory location | `pg_config --docdir` |
| `html` documentation location | `pg_config --htmldir` |
| C header file locations | `pg_config --includedir` |
| Object library files | `pg_config --libdir` |
| Share files | `pg_config --sharedir` |
| Configuration details | `pg_config --configure` |

For more options, see the `pg_config` man page:

`pg_config --help`

## Installing pgEdge Enterprise Postgres and Controlling the Cluster

To install pgEdge Enterprise Postgres and supporting component packages (like pgAdmin, pgBouncer, and pgBackRest), use the command:

  `sudo apt-get install pgedge-enterprise-all-18`

When you install pgEdge Enterprise Postgres on a Debian host, the cluster is automatically initialized; to review cluster details, use the command:

    sudo pg_lsclusters

For example:

    ```bash
    sudo pg_lsclusters
    Ver Cluster Port Status Owner    Data directory              Log file
    18  main    5432 online postgres /var/lib/postgresql/18/main /var/log/postgresql/postgresql-18-main.log
    ```

You can use [`pg_ctl`](https://www.postgresql.org/docs/18/app-pg-ctl.html) to control the service on a Debian host; for example, to stop the service, use the command:

  `sudo pg_ctlcluster 18 main stop`

To check the service status, use the following command:

  `sudo pg_ctlcluster 18 main status`
  
  `pg_ctl: no server running`

To start the service and check the status:

  `sudo pg_ctlcluster 18 main start && sudo pg_ctlcluster 18 main status`

   ```bash
   pg_ctl: server is running (PID: 13067)
   /usr/lib/postgresql/18/bin/postgres "-D" "/var/lib/postgresql/18/main" "-c" "config_file=/etc/postgresql/18/main/postgresql.conf"
   ```

Installation of the server package creates a database user named `postgres`.  This user has no default password.  To set a password for the `postgres` user, connect with [`psql`](https://www.postgresql.org/docs/18/app-psql.html) and use the [`ALTER ROLE`](https://www.postgresql.org/docs/17/sql-alterrole.html) command.  For example:

  ```sql
  $ sudo -u postgres psql

  postgres=# ALTER ROLE postgres PASSWORD '1safepassword!';
  ALTER ROLE
  ```

### License

Use of components distributed via the `pgedge` repository is governed by product-specific licenses; see the bundled readme files for more information.