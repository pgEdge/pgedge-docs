# Installing pgEdge Distributed Postgres (VM Edition)

There are several ways to install pgEdge Distributed Postgres (VM Edition) and deploy a replication cluster.  You can:

* Use the VM Edition's command-line interface (CLI) `cluster` module to create a .json file that [deploys a cluster on local or remote hosts](../installing_pgedge/cluster_deploy.md). This method also simplifies installation and configurion of pgBackRest on the new cluster.
* Log in to each CLI host and [manually deploy a cluster](../installing_pgedge/manual.md).


## Installing the CLI

A distributed Postgres cluster traditionally lives on two or more hosts; to prepare a CLI host, you should:

* [Set SELinux to `permissive` or `disabled` mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/changing-selinux-states-and-modes_using-selinux), followed by a system reboot.
* Configure [passwordless sudo access](../prerequisites/index.md#configuring-passwordless-sudo) for a non-root OS user.
* Configure [passwordless ssh](../prerequisites/index.md#configuring-passwordless-ssh) access for the same non-root OS user.
* Open any firewalls that could obstruct access between hosts.

Then, install the CLI on each host with the command:

`python3 -c "$(curl -fsSL https://downloads.pgedge.com/platform/repos/download/install.py)"`

Paste the command into your command line client and press `Return`.

!!! info

    Note that depending on your system configuration, you may need to preface commands with sudo; for example, `sudo python3 -c "$(curl -fsSL https://downloads.pgedge.com/platform/repos/download/install.py)"`.

