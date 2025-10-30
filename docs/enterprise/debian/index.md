# pgEdge Enterprise Postgres (VM Edition)

pgEdge Enterprise Postgres (and supporting component) packages for Debian and Ubuntu are supported on: 

Ubuntu

  * Ubuntu 22.04 LTS (AMD & ARM)

  * Ubuntu 24.04 LTS (AMD & ARM)

Debian

  * Debian 11 (AMD & ARM)

  * Debian 12 (AMD & ARM)

  * Debian 13 (AMD & ARM)

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

!!! info

    Installing packages with pgEdge Enterprise Postgres (e.g., pgedge-postgresql-18 or related components) will remove any previously installed community Postgres packages (versions 12–18).  This behavior is consistent with community Postgres packages.  If you wish to keep your existing Postgres installation, install pgEdge Enterprise Postgres in a separate environment (such as a container or virtual machine).