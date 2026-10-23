# Configuring the Repository

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

**Meeting Platform-Specific Prerequisites**

Before configuring local access to the repository (`pgedge`), you should ensure that your system does not contain any community Postgres packages.  Then, install the platform-specific prerequisites for your system with the commands:

* Red Hat Enterprise Linux v10  

```bash
  sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-10.noarch.rpm
  sudo subscription-manager repos --enable codeready-builder-for-rhel-10-$(arch)-rpms
```

* Red Hat Enterprise Linux v9

```bash
  sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
  sudo dnf config-manager --set-enabled codeready-builder-for-rhel-9-rhui-rpms
```

* Oracle Enterprise Linux v10

```bash
  sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-10.noarch.rpm
  sudo dnf config-manager --set-enabled ol10_codeready_builder
```

* Oracle Enterprise Linux v9

```bash
  sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
  sudo dnf config-manager --set-enabled ol9_codeready_builder
```

* Alma Linux v9/10

```bash
  sudo dnf install -y epel-release
  sudo dnf config-manager --set-enabled crb
```

* Rocky Linux v9/10

```bash
  sudo dnf install -y epel-release
  sudo dnf config-manager --set-enabled crb
```

## Disable the PGDG repository (if enabled)

If you have enabled the PostgreSQL Global Development Group (PGDG) community repository,
disable the repository before installing pgEdge packages. PGDG packages share file paths
with pgEdge packages (e.g., pgBouncer, postgresql-common), which may cause installation
failures:

```bash
sudo dnf config-manager --set-disabled pgdg*
```

## Creating the Repository

After meeting the prerequisites for your system, create the repository with
the command:

```bash
sudo dnf install -y https://downloads.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm
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
After installing the certificate, you're ready to
[use the repository](./installing.md) to install Postgres and supporting
components.
