# Configuring the Repository

pgEdge Enterprise Postgres (and supporting component) packages for Debian and Ubuntu are supported on: 

Ubuntu

  * Ubuntu 22.04 LTS (AMD & ARM)

  * Ubuntu 24.04 LTS (AMD & ARM)

Debian

  * Debian 11 (AMD & ARM)

  * Debian 12 (AMD & ARM)

  * Debian 13 (AMD & ARM)

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

**Meeting Platform-Specific Prerequisites**

Before configuring local access to the repository (`pgedge`), you should ensure that your system does not contain any community Postgres packages.  Then, install the platform-specific prerequisites for your system with the commands:

```bash
sudo apt-get update
sudo apt-get install -y curl
sudo apt-get install -y gnupg2
sudo apt-get install lsb-release
```

## Creating the Repository

After meeting the prerequisites for your system, create the repository with the command:

`sudo curl -sSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb`

`sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb || true` 

After creating the repository, you're ready to use the repository to [install Postgres](./installing.md) and [supporting components](./components.md).