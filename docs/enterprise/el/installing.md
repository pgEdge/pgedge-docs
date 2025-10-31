# Using pgEdge Enterprise Postgres Packages

After installing the `pgedge` repository, you're ready to create Postgres databases and install supporting components. If needed, modify the sample commands that follow to use your preferred package manager.

!!! info

    Installing packages with pgEdge Enterprise Postgres (e.g., pgedge-postgresql-18 or related components) will remove previously installed community Postgres packages. If you wish to keep your existing Postgres installation, install pgEdge Enterprise Postgres in a separate environment (such as a container or virtual machine).

To review a list of packages available from the `pgedge` repository, use the command:

  `dnf repoquery --available --repo=pgedge`

To see a list of components installed by a specific package, use the command:

  `repoquery -l package_name`

To install a package, you can use conventional syntax and options:

  `sudo dnf install package_name`

For example, to install only those packages required to set up a Postgres 18 database, use the command:

  `sudo dnf install pgedge-enterprise-postgres_18`

**Installed File Locations**

When you install a package, binaries are placed in `/usr/pgsql-18/bin`. You may wish to add `/usr/pgsql-18/bin` to your `$PATH` variable in `/etc/profile` for easy access to supported components and Postgres utilities.

The packages install files in the following locations:

| File Type | Location |
|-----------|----------|
| Executables | `/usr/pgsql-18/bin` |
| Libraries | `/usr/pgsql-18/lib` |
| Documentation | `/usr/pgsql-18/doc` |
| Contrib documentation | `/usr/pgsql-18/doc` |
| Data | `/var/lib/pgsql/18/data` |
| Backup area | `/var/lib/pgsql/18/backups` |
| Templates | `/usr/pgsql-18/share` |
| Procedural Languages | `/usr/pgsql-18/lib` |
| Development Headers | `/usr/pgsql-18/include` |
| Other shared data | `/usr/pgsql-18/share` |
| Regression tests | `/usr/pgsql-18/lib/test` |


## Installing pgEdge Enterprise Postgres and Initializing a Database

To install pgEdge Enterprise Postgres and supporting component packages (like pgAdmin, pgBouncer, and pgBackRest), use the command:

  `sudo dnf install pgedge-enterprise-all_18`

After installing the packages, you can initialize a Postgres 18 database by assuming the `root` identity and invoking the command:

  `postgresql-18-setup initdb`

Then, start the Postgres server; as `root`, use the command:

  `systemctl start postgresql-18.service`

To configure the Postgres server to autostart with system reboots, use the following command:

  `systemctl enable postgresql-18.service`

These commands expect the service to be on the localhost, listening on port `5432`. To confirm that the service is working, you can connect with psql and query the server:

  ```sql
  sudo -u postgres ./psql -U postgres -p 5432
  psql (18.0)
  Type "help" for help.

  postgres=# SELECT version();
    version                                                  
  -------------------------------
   PostgreSQL 18.0 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 11.5.0 20240719 (Red Hat 11.5.0-5), 64-bit
  (1 row)
  ```

Installation of the server package creates a database user named `postgres`.  This user has no default password.  To set a password for the postgres user, use the Postgres [`ALTER ROLE`](https://www.postgresql.org/docs/18/sql-alterrole.html) command.  For example:

  ```sql
  postgres=# ALTER ROLE postgres PASSWORD '1safepassword!';
  ALTER ROLE
  ```

### License

Use of components distributed via the `pgedge` repository is governed by product-specific licenses; see the bundled readme files for more information.