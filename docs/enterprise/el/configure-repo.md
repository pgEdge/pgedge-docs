# Configuring the Repository

Using packages from the `pgedge` repository is an easy way to manage Postgres and supporting components.

**Meeting Platform-Specific Prerequisites**

Before configuring local access to the repository (`pgedge`), you should ensure that your system does not contain any community Postgres packages.  Then, install the platform-specific prerequisites for your system with the commands:

* Red Hat Enterprise Linux v10  

```bash
  sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-10.noarch.rpm
  sudo subscription-manager repos --enable codeready-builder-for-rhel-10-x86_64-rpms
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

## Creating the Repository

After meeting the prerequisites for your system, create the repository with the command:

`sudo dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm` 

After creating the repository, you're ready to [use the repository](./installing.md) to install Postgres and supporting components.