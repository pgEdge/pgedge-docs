# Configuring the Repository

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

**Meeting Platform-Specific Prerequisites**

Before configuring local access to the repository (`pgedge`), you should ensure that your system does not contain any community Postgres packages.  Then, install the platform-specific prerequisites for your system with the commands:

```bash
sudo apt-get update
sudo apt-get install -y curl
sudo apt-get install -y gnupg2
sudo apt-get install lsb-release
```

## Registering Your Certificate

Access to the `pgedge` repository requires a certificate from pgEdge. To
request one, see
[Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).
pgEdge sends you two files: `client.crt`, the certificate, and `client.key`,
its private key. Copy both files to the host, then install them in
`/etc/pgedge`. `apt` downloads packages as the `_apt` user, so that user owns
the private key:

```bash
sudo install -d -m 0755 /etc/pgedge
sudo install -m 0644 client.crt /etc/pgedge/client.crt
sudo install -o _apt -g root -m 0400 client.key /etc/pgedge/client.key
```

## Creating the Repository

After meeting the prerequisites for your system, create the repository with the command:

```bash
sudo curl -sSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb

sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb || true
```

After creating the repository, you're ready to use the repository to [install Postgres](./installing.md) and [supporting components](./components.md).