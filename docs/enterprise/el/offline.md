# Creating an Offline Repository

The `pgedge` repository provides packages that provide a simplified way to install Postgres; you can use a copy of the `pgedge` repository to create an offline repository for use on systems with restricted internet access.

Creating an offline repository requires two systems:

* You will need to use an OS compatible system with internet access to download and create a *live* model of the repository. 

* You will need an OS compatible system with access to the machine with internet access; after creating the model on the first host, you will copy the repository to the system without internet access.

You must ensure the system with internet access and the offline target server that will eventually host the repository have the same OS version and architecture.

1. Create a temporary repository on the online machine with the command:

    `dnf install -y https://downloads.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm`

2. Install prerequisite software on the both the host with access and the repository host.  

    For **Rocky or Alma Linux 9x or 10x (x86_64)**, use the commands:

    `sudo dnf install -y epel-release`

    `sudo dnf config-manager --set-enabled crb` 

    For **RHEL 9x (x86_64)**:

    `sudo dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm`

    `sudo subscription-manager repos --enable codeready-builder-for-rhel-9-x86_64-rpms`

    For **RHEL 10 x86_64**:

    `sudo dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-10.noarch.rpm`

    `sudo subscription-manager repos --enable codeready-builder-for-rhel-10-x86_64-rpms`

3. Register the online machine and install its certificate, so it can
   download packages from the `pgedge` repository. Create the certificate
   request with the command:

    `sudo pgedge-subscription-manager register-system`

    Email the `client.csr` file the command names to `support@pgedge.com`.
    When pgEdge returns your certificate, install it with the command:

    `sudo pgedge-subscription-manager install /path/to/client.crt`

    For details, see
    [Obtaining and Installing a Repository Certificate](../index.md#obtaining-and-installing-a-repository-certificate).

4. Download the content of the `pgedge` repository:

    `sudo dnf -y install --downloadonly --downloaddir=<target_directory>/pgedge-enterprise-all_18 pgedge-*` 

5. After creating the model of the repository on the temporary host, you can transfer the entire repo to the offline repository host.

**Using the Repository**

The offline repository host and the systems that install from it do not need
a certificate; only the online machine that downloads the packages does.

To use your local repository, include the `localinstall` clause when you invoke `dnf` to install packages.  For example, to install all of the pgEdge Enterprise Postgres packages:

`sudo dnf localinstall pgedge-enterprise-all_18*` 

To install just the pgEdge Enterprise Postgres packages:

`sudo dnf localinstall pgedge-enterprise-postgres_18*` 

Or, to install each pgEdge component individually, specify a component name:

`sudo dnf localinstall pgedge-spock50_18*` 

