# Preparing your System

On each machine that will host a replication node, you must:

* Open any firewalls that could obstruct access between your servers.
* [Set SELinux to `permissive` or `disabled` mode on each host](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/changing-selinux-states-and-modes_using-selinux), followed by a system reboot.
* Configure [passwordless sudo access](#configuring-passwordless-sudo) for a non-root OS user on each host.
* Configure [passwordless ssh](#configuring-passwordless-ssh) access for the same non-root OS user on each host.

There are a number of considerations that should go into your [schema design](https://docs.pgedge.com/platform/prerequisites/configuring) to really take advantage of active-active replication.

#### Configuring Passwordless SSH

You can use the following steps to configure passwordless SSH on each node of the replication cluster:

```sh
ssh-keygen -t rsa
cd ~/.ssh
cat id_rsa.pub >> authorized_keys
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```

#### Configuring Passwordless sudo

To configure passwordless sudo, open the /etc/sudoers file, and add a line of the form:

%username         ALL = (ALL) NOPASSWD: ALL

Where `username` specifies the name of your operating system user.







