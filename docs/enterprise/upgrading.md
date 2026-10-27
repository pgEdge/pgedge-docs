# Performing an Upgrade

You can use the `pgedge` repository to upgrade an existing pgEdge Enterprise
Postgres installation to a newer minor or major version of Postgres. A minor
version upgrade (for example, from 18.0 to 18.1) replaces the packages in
place; a major version upgrade (for example, from 17 to 18) installs the new
version beside the old one and migrates your data with
[pg_upgrade](https://www.postgresql.org/docs/current/pgupgrade.html).

!!! info

    Before you start an upgrade, take a recent backup so that you can revert
    to your previous version if needed.

The host must have the current repository package and an installed repository
certificate before you upgrade. If you installed the `pgedge` repository
before March 1, 2026, update the repository first, as described in
[Updating your Repository for FIPS Support](fips_update.md). If you're moving
from community Postgres, see Migrating to pgEdge Enterprise Postgres for
[Enterprise Linux](el/migrating.md) or for
[Debian and Ubuntu](debian/migrating.md) instead.

The examples on this page upgrade Postgres 18 to a newer minor version, and
Postgres 17 to Postgres 18; substitute the versions on your host.

## Performing a Minor Version Upgrade

Minor versions of Postgres share the same data directory format, so a minor
version upgrade installs the newer packages and restarts the server.

!!! note

    If the host is a node in a Spock cluster, upgrade Spock first with the
    steps in Upgrading Spock for [Enterprise Linux](el/upgrading-spock.md)
    or for [Debian and Ubuntu](debian/upgrading-spock.md). Those steps
    disable Auto-DDL across the cluster before you upgrade the extension.

### Upgrading on Enterprise Linux

The following commands upgrade every installed pgEdge package to the newest
version in the repository, and restart the Postgres 18 server:

```bash
sudo dnf upgrade 'pgedge-*'
sudo systemctl restart postgresql-18
```

To confirm the new version, use the command:

```bash
sudo -u postgres psql -c "SELECT version();"
```

### Upgrading on Debian and Ubuntu

The following commands refresh the package lists, upgrade the installed
packages, and restart the Postgres 18 cluster:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo systemctl restart postgresql@18-main
```

The `apt-get upgrade` command upgrades every package with a newer version
available, including packages from other repositories. To review the pgEdge
packages that `apt-get upgrade` will update, run the
`apt list --upgradable | grep pgedge` command before you upgrade.

To confirm the new version, use the command:

```bash
sudo -u postgres psql -c "SELECT version();"
```

## Performing a Major Version Upgrade

A new major version of Postgres uses a different data directory format, so
you install the new version beside the old one and use `pg_upgrade` to migrate
your data. The steps on this page upgrade a single server; if the server is a
node in a Spock cluster, contact pgEdge support before you begin.

Install the same extensions for the new version that your databases use on
the old version; `pg_upgrade` fails its compatibility check if an extension's
library is missing. To install the complete set of pgEdge packages for the
new version, use the `pgedge-enterprise-all_18` package on Enterprise Linux
or the `pgedge-enterprise-all-18` package on Debian and Ubuntu.

### Upgrading on Enterprise Linux

On Enterprise Linux, you initialize the new data directory yourself and then
run `pg_upgrade` to migrate the old cluster. Use the following steps to
upgrade from Postgres 17 to Postgres 18:

1. Install the Postgres 18 packages with the command:

    ```bash
    sudo dnf install -y pgedge-enterprise-postgres_18
    ```

2. Check whether the old cluster uses data checksums. The `initdb` command
   in Postgres 18 enables data checksums by default, and `pg_upgrade`
   requires both clusters to use the same setting. The following command
   reports the setting on the old server:

    ```bash
    sudo -u postgres psql -c "SHOW data_checksums;"
    ```

3. Initialize the Postgres 18 data directory, but don't start the server
   yet. If the old cluster reports `off` for data checksums, use the
   following command to initialize the new cluster without them:

    ```bash
    sudo PGSETUP_INITDB_OPTIONS="--no-data-checksums" \
        /usr/pgsql-18/bin/postgresql-18-setup initdb
    ```

    If the old cluster reports `on`, use the command:

    ```bash
    sudo /usr/pgsql-18/bin/postgresql-18-setup initdb
    ```

4. Stop the Postgres 17 server with the command:

    ```bash
    sudo systemctl stop postgresql-17
    ```

5. Test the upgrade as the `postgres` user. The `--check` option compares
   the two clusters and reports problems without changing any data:

    ```bash
    sudo -iu postgres /usr/pgsql-18/bin/pg_upgrade \
        --old-datadir=/var/lib/pgsql/17/data \
        --new-datadir=/var/lib/pgsql/18/data \
        --old-bindir=/usr/pgsql-17/bin \
        --new-bindir=/usr/pgsql-18/bin \
        --check
    ```

    Resolve any problems the check reports, then run the command again
    without the `--check` option to perform the upgrade.

6. Copy your configuration changes to the new cluster; `pg_upgrade` does
   not migrate configuration files. Review the `postgresql.conf` and
   `pg_hba.conf` files in `/var/lib/pgsql/17/data`, and apply your custom
   settings to the matching files in `/var/lib/pgsql/18/data`.

7. Start the Postgres 18 server, and stop the Postgres 17 server from
   starting at boot, with the commands:

    ```bash
    sudo systemctl disable postgresql-17
    sudo systemctl enable --now postgresql-18
    ```

8. Run the follow-up commands that `pg_upgrade` printed when the upgrade
   finished, as the `postgres` user. These commands include a `vacuumdb`
   command that updates the optimizer statistics for the new cluster.

9. Update your `PATH` to use the Postgres 18 binaries; for example:

    ```bash
    echo 'export PATH=/usr/pgsql-18/bin:$PATH' >> ~/.bashrc
    source ~/.bashrc
    ```

When you have confirmed that the new cluster works, you can remove the old
cluster. The `pg_upgrade` command creates a `delete_old_cluster.sh` script in
the `postgres` user's home directory that removes the Postgres 17 data
directory. To find the Postgres 17 packages to remove with `dnf remove`, use
the command:

```bash
dnf list installed 'pgedge-*'
```

### Upgrading on Debian and Ubuntu

On Debian and Ubuntu, the `pg_upgradecluster` command creates the new cluster,
copies its configuration, and runs `pg_upgrade` for you. Use the following
steps to upgrade from Postgres 17 to Postgres 18:

1. Install the Postgres 18 packages with the commands:

    ```bash
    sudo apt-get update
    sudo apt-get install -y pgedge-enterprise-postgres-18
    ```

2. Remove the empty Postgres 18 cluster that the installation created
   automatically; `pg_upgradecluster` needs to create the cluster itself.
   Before you remove the cluster, make sure that the cluster holds no
   data you want to keep. Use the command:

    ```bash
    sudo pg_dropcluster 18 main --stop
    ```

3. Upgrade the Postgres 17 cluster with the following command. The
   `--method=upgrade` option uses `pg_upgrade` to migrate the data:

    ```bash
    sudo pg_upgradecluster --method=upgrade 17 main
    ```

    The command stops the Postgres 17 cluster, creates and upgrades the
    Postgres 18 cluster, and starts the new cluster on the old cluster's
    port.

4. Confirm that the Postgres 18 cluster is online with the command:

    ```bash
    sudo pg_lsclusters
    ```

5. Update your `PATH` to use the Postgres 18 binaries; for example:

    ```bash
    echo 'export PATH=/usr/lib/postgresql/18/bin:$PATH' >> ~/.bashrc
    . ~/.bashrc
    ```

When you have confirmed that the new cluster works, remove the old cluster
with the following command, and then remove the Postgres 17 packages:

```bash
sudo pg_dropcluster 17 main
```
