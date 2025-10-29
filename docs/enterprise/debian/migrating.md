# Migrating from Community Postgres to pgEdge Enterprise Postgres

The steps required to make the move from community Postgres to pgEdge Postgres will vary based on your current installation, the current version, and installation details. 

!!! info

    Before starting a migration or upgrade, ensure that you have a recent backup in case you need to revert to your previous version.

The following sections provide sample commands; please note that commands may vary depending on your system and configuration.

## Migrating Between the Same Postgres Versions

If your current Postgres version is the same as your target Postgres version, you can simply switch repositories and perform an upgrade; the `data` directories are compatible:

1. Disable the `pgdg` repository.  You can use the command:

    `sudo dnf config-manager --disable pgdg*`

2. [Enable the `pgedge` repository](../debian/configure-repo.md) with the commands:

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

2. [Enable the `pgedge` repository](../debian/configure-repo.md) with the commands:

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

    `sudo sh -c 'ls /etc/apt/sources.list.d/pgdg*.list >/dev/null 2>&1 && mv /etc/apt/sources.list.d/pgdg*.list /etc/apt/sources.list.d/pgdg.list.disabled || true'`
   
    `sudo apt-get update `

2. [Enable the `pgedge` repository](../debian/configure-repo.md) with the commands:

    `curl -fsSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb`

    `sudo apt-get install -y /tmp/pgedge-release.deb`

    `rm -f /tmp/pgedge-release.deb`

    `sudo apt-get update`

3. Install the newer version of Postgres, create a cluster, and start the postmaster:

    `sudo apt-get install -y pgedge-enterprise-postgres-18`

    `sudo pg_createcluster 18 main -- --locale=C.UTF-8 --encoding=UTF8`

    `sudo pg_ctlcluster 18 main start`

4. Invoke the new version of the [pg_upgrade](https://www.postgresql.org/docs/17/pgupgrade.html) utility (the version located in the newly created `/usr/pgsql-17/bin` directory) to migrate your Postgres installation. For example, the following command converts a version 16 installation to a version 17 installation:

    ```bash
    /usr/lib/postgresql/18/bin/pg_upgrade \
    --old-datadir=/var/lib/postgresql/17/main \
    --new-datadir=/var/lib/postgresql/18/main \
    --old-bindir=/usr/lib/postgresql/17/bin \
    --new-bindir=/usr/lib/postgresql/18/bin \
    --username=postgres \
    --check
    ```

    Note that you can invoke the command with the `--check` option to perform a test upgrade before invoking the command without `--check` to perform the actual upgrade.

5. When the upgrade completes, restart the server with the command:

    `sudo systemctl restart postgresql@18-main`

6. Then, adjust your PATH to point to the new version of Postgres; for example:

    `echo 'export PATH=/usr/lib/postgresql/18/bin:$PATH' >> ~/.bashrc`

    `. ~/.bashrc`


