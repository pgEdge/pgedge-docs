# Creating an Offline Repository for pgEdge Distributed Postgres

pgEdge provides a package you can use to create an offline repository if your installation resides in an airgapped environment. The package bundles the supported software required to create a repository into a single .tgz file, enabling seamless setup of pgEdge Distributed Postgres and the command line interface without direct internet access by the eventual host of the repository. This section outlines the steps required to use the package to set up and manage an offline repository. The high-level process includes:

**Downloading the pgEdge Package:** Obtain the package from an internet-connected machine and transfer it to the airgapped environment, and configure a local web server to host the repository.

**Upgrading the Offline Repository:** Check for newer versions, download the updated package, and restart the local repository server with the latest files.

**Updating and Upgrading the pgEdge CLI:** Refresh metadata and upgrade the pgEdge command line interface (CLI) on each node.

**Upgrading Components:** Upgrade individual components (for example, Spock or Snowflake) to their latest versions using the CLI.

The following sections provide detailed instructions, including commands and configuration steps, for each part of the process.

## Downloading the pgEdge Package

Use a system with internet connectivity to download the latest version of the pgEdge package. The following fixed redirect URLs always point to the latest version of the .tgz file:

x86_64/amd64 architectures:

`https://downloads.pgedge.com/platform/repos/download/pgedge-latest-amd.tgz`

Arm64 architectures:

`https://downloads.pgedge.com/platform/repos/download/pgedge-latest-arm.tgz`

Choose the URL that matches your target system's architecture.
 
!!! info

    When using command-line tools like wget to download the .tgz file, include the --content-disposition flag to handle the content-disposition headers correctly. This ensures the file retains its proper versioned filename (for example, `pgedge-24.10-10-amd.tgz`): 
    
    `wget --content-disposition https://downloads.pgedge.com/platform/repos/download/pgedge-latest-amd.tgz`

After downloading the appropriate package, move the .tgz file to the airgapped machine that will host the offline repository.

### Configuring the pgEdge Offline Repository

The next steps demonstrate how to set up a local pgEdge offline repository on `localhost`. The supplied `startLOCAL` and `stopLOCAL` scripts use Python's built-in `http.server` module to start a webserver serving the repository on port `8000`. If you intend to host this repository through a different web server, or run it on a custom IP/port, please make the necessary adjustments to align with your specific environment.

Use the following command to extract the downloaded tgz; substitute the version and architecture into the archive name:

`tar xvf pgedge-version-architecture.tgz`

This command extracts the package to a new directory.  Navigate to the `pgedge/data/conf/cache` directory within the extracted files. This directory contains the packages and includes scripts to facilitate running a web server directly from this location.

Invoke the following command to start the webserver:

`./startLOCAL`

This command starts the webserver in the current directory and display the URL of the repository (for example, `REPO=http://0.0.0.0:8000`).

Then, you can use the repository to configure and deploy a pgEdge Distributed Postgres cluster.


### Upgrading an Offline pgEdge Repository

The steps that follow outline how to upgrade your existing repository to a newer version of pgEdge software. The steps in this section explain how to update the repository itself, the CLI, and supported components like Spock. These instructions assume the repository is hosted on the same machine as your node; adjust the paths if your setup uses a shared system or a custom web server.

**Checking the Latest Version of the Offline Repository**

Before upgrading or downloading the repository, confirm that you are upgrading to the most recent version using the .version files provided.

x86_64/amd64 Architectures:

`https://downloads.pgedge.com/platform/repos/download/pgedge-latest-amd.version`

Arm64 Architectures:

`https://downloads.pgedge.com/platform/repos/download/pgedge-latest-arm.version`


**Performing a Repository Upgrade:**

Navigate to `pgedge/data/conf/cache` in the older offline repository and stop the webserver: 

`./stopLOCAL`

Refer to the instructions in [Downloading the pgEdge Package](#downloading-the-pgedge-package) to download the package that corresponds to your architecture.

Extract the latest downloaded package:

`tar xvf pgedge-24.10-10-amd.tgz`

This command extracts the content to a new directory.  Navigate to `pgedge/data/conf/cache` in the extracted directory and start the webserver: 

`./startLOCAL`

When the webserver starts, the command will display the URL of the repository (which should be the same as before: `REPO=http://0.0.0.0:8000`).


