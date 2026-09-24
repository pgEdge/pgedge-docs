# pgEdge Enterprise Postgres (VM Edition)

pgEdge Enterprise Postgres (and supporting component) packages for Debian and Ubuntu are supported on: 

Ubuntu

  * Ubuntu 22.04 LTS (AMD & ARM)

  * Ubuntu 24.04 LTS (AMD & ARM)

Debian

  * Debian 12 (AMD & ARM)

  * Debian 13 (AMD & ARM)

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

!!! warning "Debian 11 (Bullseye) Support Ended"

    Debian 11 (Bullseye) is no longer a supported platform for pgEdge
    Enterprise Postgres. Existing Debian 11 installations will continue
    to run, but pgEdge will not publish new packages, security patches,
    or updates for this platform. Upgrade to Debian 12 (Bookworm) or
    Debian 13 (Trixie) to continue receiving updates.

!!! info

    Installing packages with pgEdge Enterprise Postgres (e.g., pgedge-postgresql-18 or related components) will remove any previously installed community Postgres packages (versions 12–18).  This behavior is consistent with community Postgres packages.  If you wish to keep your existing Postgres installation, install pgEdge Enterprise Postgres in a separate environment (such as a container or virtual machine).