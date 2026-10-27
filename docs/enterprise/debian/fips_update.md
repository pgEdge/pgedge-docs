# Updating your Repository for FIPS Support

The `pgedge` repository distributes FIPS-enabled native packages for Debian
and Ubuntu platforms.

!!! hint

    If you created your repository before March 1, 2026, replace the
    repository package, register the host for a repository certificate, and
    refresh the content. The new repository package leaves the repository
    disabled until you install the certificate, so the host can't install or
    update packages from the `pgedge` repository until pgEdge returns your
    certificate and you install it.

## Updating a Debian Repository Host

On a Debian system, use the following steps to update your repository.

1. Replace the repository sources with the following commands:

``` bash
sudo rm -f /etc/apt/sources.list.d/pgedge.sources
sudo curl -sSL https://downloads.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb && sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb
```

2. Register the host and install its certificate. The new repository
   package adds the repository disabled, and installing a certificate enables
   it. Create the certificate request with the command:

``` bash
sudo pgedge-subscription-manager register-system
```

   Email the `client.csr` file the command names to
   [support@pgedge.com](mailto:support@pgedge.com). When pgEdge returns your
   certificate, install it with the command:

``` bash
sudo pgedge-subscription-manager install complete_path_to/client.crt
```

   For details, see
   [Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).

3. Refresh the repository contents and upgrade the packages:

``` bash
sudo apt-get update
sudo apt-get upgrade <package_name>
```
