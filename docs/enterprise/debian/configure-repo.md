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

## Creating the Repository

After meeting the prerequisites for your system, create the repository with
the command:

```bash
sudo curl -sSL https://downloads.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb

sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb || true
```

## Registering Your Certificate

Access to the `pgedge` repository requires a certificate from pgEdge. The
repository package installs the `pgedge-subscription-manager` tool, which
creates the host's private key and certificate signing request. The following
command registers the host and writes the request to the `client.csr` file:

```bash
sudo pgedge-subscription-manager register-system
```

Email the `client.csr` file to pgEdge support at `support@pgedge.com`. pgEdge
returns your certificate, `client.crt`, by email. Copy `client.crt` to the
host, then run the following command in the directory that contains it to
install the certificate:

```bash
sudo pgedge-subscription-manager install client.crt
```

For more information about certificate expiry, see
[Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).
After installing the certificate, you're ready to use the repository to
[install Postgres](./installing.md) and
[supporting components](./components.md).