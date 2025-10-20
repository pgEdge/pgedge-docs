# Migrating from Community Postgres to pgEdge Enterprise Postgres

The steps required to make the move from community Postgres to pgEdge Postgres will vary based on your current installation, the current version, and installation details. 

!!! info

    Before starting a migration or upgrade, ensure that you have a recent backup in case you need to revert to your previous version.

The following sections provide sample commands; please note that commands may vary depending on your system and configuration.


## Migrating Between the Same Postgres Versions

If your current Postgres version is the same as your target Postgres version, you can simply switch repositories and perform an upgrade; the `data` directories are compatible:

1. Disable the `pgdg` repository.  You can use the command:

  `sudo dnf config-manager --disable pgdg*`

2. [Enable the `pgedge` repository](../el/configure-repo.md) with the commands:

  `sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm`
  
  `sudo dnf config-manager --set-enabled crb`
  
  `sudo dnf install epel-release`

3. Upgrade to the latest version of Postgres with the command:

  `sudo dnf upgrade postgresql18*`

4. When the upgrade completes, restart the server with the command:

  `systemctl restart postgresql-18.service`

5. Then, adjust your PATH to point to the new version of Postgres; for example:

  `echo 'export PATH=/opt/pgedge/18/bin:$PATH' >> ~/.bashrc`
  
  `source ~/.bashrc`


## Performing a Minor Version Upgrade to pgEdge Enterprise Postgres

If your installed version of Postgres is the same major version but an older minor version as the version of pgEdge Enterprise Postgres you're migrating to, `data` directories are compatible, and the upgrade path is fairly simple:

1. Disable the `pgdg` repository.  You can use the command:

  `sudo dnf config-manager --disable pgdg*`

2. [Enable the `pgedge` repository](../el/configure-repo.md) with the commands:

  `sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm`

3. Upgrade to the latest minor version of Postgres with the command:

  `sudo dnf upgrade postgresql18*`

4. When the upgrade completes, restart the server with the command:

  `systemctl restart postgresql-18.service`

5. Then, adjust your PATH to point to the new version of Postgres; for example:

  `echo 'export PATH=/opt/pgedge/18/bin:$PATH' >> ~/.bashrc`

  `source ~/.bashrc`


## Performing a Major Version Upgrade to pgEdge Enterprise Postgres

To perform a migration from an older major version of community Postgres to a more recent major version of pgEdge Enterprise Postgres, you will need to use [pg_upgrade](https://www.postgresql.org/docs/current/pgupgrade.html). The following is a high-level overview of the steps required:

1. Disable the `pgdg` repository.  You can use the command:

  `sudo dnf config-manager --disable pgdg*`

2. [Enable the `pgedge` repository](../el/configuring.mdx) with the commands:

  `sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm`
  
  `sudo dnf config-manager --set-enabled crb`
  
  `sudo dnf install epel-release`

3. Install the newer version of Postgres and [initialize a new `data` directory](../el/installing.md#installing-pgedge-enterprise-postgres-and-initializing-a-database):

  `sudo dnf install pgedge-enterprise-postgres_18`

  `postgresql-18-setup initdb`

  `systemctl start postgresql-18.service`

4. Invoke the new version of the [pg_upgrade](https://www.postgresql.org/docs/18/pgupgrade.html) utility (the version located in the newly created `/usr/pgsql-18/bin` directory) to migrate your Postgres installation. For example, the following command converts a version 16 installation to a version 17 installation:

  ```bash
  /usr/pgsql-18/bin/pg_upgrade \
  --old-datadir=/var/lib/pgsql/17/data \
  --new-datadir=/var/lib/pgsql/18/data \
  --old-bindir=/usr/pgsql-17/bin \
  --new-bindir=/usr/pgsql-18/bin \
  --username=postgres \
  --check
  ```

  Note that you can invoke the command with the `--check` option to perform a test upgrade before invoking the command without `--check` to perform the actual upgrade.

5. When the upgrade completes, restart the server with the command:

  `systemctl restart postgresql-18.service`

6. Then, adjust your PATH to point to the new version of Postgres; for example:

  `echo 'export PATH=/opt/pgedge/18/bin:$PATH' >> ~/.bashrc`

  `source ~/.bashrc`


