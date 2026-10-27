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
sudo pgedge-subscription-manager install complete_path_to/client.crt
```

For file locations, the `status` command, and certificate expiry, see
[Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).
After installing the certificate, you're ready to
[use the repository](./installing.md) to install Postgres and supporting
components.
