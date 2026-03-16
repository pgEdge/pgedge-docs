# Updating your Repository for FIPS Support

The `pgedge` repository distributes FIPS-enabled native packages for RHEL
and Debian platforms. If you created your repository after March 1, 2026, your
repository should be configured to use FIPS-enabled packages, but if you
created your repository before that date, you need to replace the repository
package and refresh the content.

## Updating a RHEL Repository Host

On a RHEL-based system, you need to:

1. Replace the repository package with the following commands:

``` bash
sudo dnf remove pgedge-release
sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm
```

2. Refresh the repository contents and upgrade the packages:

``` bash
sudo dnf update
sudo dnf upgrade <package_name>
```

## Updating a Debian Repository Host

1. Replace the repository sources with the following commands:

``` bash
sudo rm -f /etc/apt/sources.list.d/pgedge.sources
sudo curl -sSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb && sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb
```

2. Refresh the repository contents and upgrade the packages:

``` bash
sudo apt-get update
sudo apt-get upgrade <package_name>
```