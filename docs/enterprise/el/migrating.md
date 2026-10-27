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

    `sudo dnf install -y https://downloads.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm`
  
    `sudo dnf config-manager --set-enabled crb`
  
    `sudo dnf install epel-release`

3. Upgrade to the latest version of Postgres with the command:

    `sudo dnf upgrade postgresql18*`

4. When the upgrade completes, restart the server with the command:

    `systemctl restart postgresql-18.service`

5. Then, adjust your PATH to point to the new version of Postgres; for example:

    `echo 'export PATH=/usr/pgsql-18/bin:$PATH' >> ~/.bashrc`
  
    `source ~/.bashrc`

## Migrating to a Newer Postgres Version

If your community Postgres installation runs an older major version than the
pgEdge Enterprise Postgres version you're moving to, migrate and upgrade in two
stages:

1. Migrate to pgEdge Enterprise Postgres at your current major version, as
   described in
   [Migrating Between the Same Postgres Versions](#migrating-between-the-same-postgres-versions).

2. Upgrade to the newer major version, as described in
   [Performing a Major Version Upgrade](upgrading.md#performing-a-major-version-upgrade).

The `pgedge` repository provides Postgres 16, 17, and 18. If your community
installation runs Postgres 15 or earlier, there is no matching pgEdge version
to migrate to first; reach out to [pgEdge support](mailto:support@pgedge.com)
for help planning the migration.
