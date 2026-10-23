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
following command, run on the host that will install the packages, registers
the host and creates its private key and a certificate signing request in the
`client.csr` file:

```bash
sudo pgedge-subscription-manager register-system
```

Email the `client.csr` file to pgEdge support at `support@pgedge.com`, with
your organization's name and customer ID, the type of certificate you need (a
trial or a paid subscription), and how long the host needs access; a trial
provides 30 days of access by default. pgEdge returns your certificate,
`client.crt`, by email. Each host that downloads packages needs its own
certificate, so repeat these steps once on every host; you can send several
requests in one email if you rename each `client.csr` to identify the host.
Copy `client.crt` to the host, then install the certificate with the following
command, giving the path to the file. The command also enables the repository,
which stays disabled until a certificate is installed:

```bash
sudo pgedge-subscription-manager install ~/Downloads/client.crt
```

For file locations, the `status` command, and certificate expiry, see
[Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).
After installing the certificate, you're ready to use the repository to
[install Postgres](./installing.md) and
[supporting components](./components.md).