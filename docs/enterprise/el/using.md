# Using pgEdge Enterprise Postgres: VM Edition for Enterprise Linux 9 and 10

Packages for Postgres and Postgres supporting components for versions 9 and 10 are supported on: 

* Red Hat Enterprise Linux
* Oracle Enterprise Linux
* Alma Linux
* Rocky Linux  

The packages available from the `pgedge` repository provide an easy way to manage Postgres and supporting components.


## Using the pgedge Repository

Before configuring local access to the pgEdge repository (`pgedge`), you should ensure that your system does not contain any community Postgres packages.  Then, install the  repository with the command:

`sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm` 

!!! note

    Depending on your system platform or configuration, you may need to use a different installation command for CRB and epel-release; the commands that follow are just examples.

Enable the CRB (CodeReady Builder) repository for use with DNF with the command:

  `sudo dnf config-manager --set-enabled crb`

You should also install the `epel-release` repository (to help satisfy prerequisites) with the command:
    
  `sudo dnf install epel-release`

**Reviewing Repository Contents**

Then, to review a list of packages available from the `pgedge` repository, use the command:

  `dnf repoquery --available --repo=pgedge`

To see a list of components installed by a specific package, use the command:

  `repoquery -l package_name`

To install a package, you can use conventional syntax and options:

  `sudo dnf install package_name`

For example, to install only those packages required to set up a Postgres database, use the command:

  `sudo dnf install pgedge-postgresql17 pgedge-postgresql17-libs pgedge-postgresql17-server`


**File Locations**

When you install a package, binaries are placed in `/usr/pgsql-17/bin`. You may wish to add `/usr/pgsql-17/bin` to your `$PATH` variable in `/etc/profile` for easy access to supported components and Postgres utilities.

The packages install files in the following locations:

| File Type | Location |
|-----------|----------|
| Executables | `/usr/pgsql-17/bin` |
| Libraries | `/usr/pgsql-17/lib` |
| Documentation | `/usr/pgsql-17/doc` |
| Contrib documentation | `/usr/pgsql-17/doc` |
| Data | `/var/lib/pgsql/17/data` |
| Backup area | `/var/lib/pgsql/17/backups` |
| Templates | `/usr/pgsql-17/share` |
| Procedural Languages | `/usr/pgsql-17/lib` |
| Development Headers | `/usr/pgsql-17/include` |
| Other shared data | `/usr/pgsql-17/share` |
| Regression tests | `/usr/pgsql-17/lib/test` |


### Installing Postgres and Initializing a Database

To install all of the Postgres packages, use the command:

  `sudo dnf install pgedge-enterprise-all_17`

After installing the packages, you can initialize a Postgres 17 database by assuming the `root` identity and invoking the command:

  `postgresql-17-setup initdb`

Then, start the Postgres server; as `root`, use the command:

  `systemctl start postgresql-17.service`

To configure the Postgres server to autostart with system reboots, use the following command:

  `systemctl enable postgresql-17.service`

These commands expect the service to be on the localhost, listening on port `5432`. To confirm that the service is working, you can connect with psql and query the server:

  ```sql
  sudo -u postgres ./psql -U postgres -p 5432
  psql (17.5)
  Type "help" for help.

  postgres=# SELECT version();
    version                                                  
  -------------------------------
   PostgreSQL 17.5 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 11.5.0 20240719 (Red Hat 11.5.0-5), 64-bit
  (1 row)
  ```

Installation of the server package creates a database user named `postgres`.  This user has no default password.  To set a password for the postgres user, use the Postgres [`ALTER ROLE`](https://www.postgresql.org/docs/17/sql-alterrole.html) command.  For example:

  ```sql
  postgres=# ALTER ROLE postgres PASSWORD '1safepassword!';
  ALTER ROLE
  ```


#### License

Use of components distributed with pgEdge RPMs is governed by product-specific licenses; see the bundled readme files for more information.