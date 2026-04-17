# Installing and Configuring Patroni and etcd

Patroni is an open-source utility for PostgreSQL that automates failover
and replica management. Patroni monitors the health of cluster nodes and
promotes a standby to primary when the primary fails, ensuring continuity
without manual intervention.

etcd is a distributed key-value store that Patroni uses as a distributed
configuration store (DCS) to maintain cluster state and leader election.
Patroni relies on etcd to coordinate which node holds the primary role
and to store configuration data shared across all cluster nodes.

Before installing and configuring Patroni and etcd in a pgEdge Enterprise
Postgres (PEP) cluster, you need to 
[install and initialize](../installing.md#installing-pgedge-enterprise-postgres-and-initializing-a-database) 
the Postgres database; the configuration steps require the location of an
empty `data` directory.

## Installing Patroni and etcd

Use the following steps to install Patroni and etcd on a RHEL-based platform.

1. Review the platform-specific prerequisites for RHEL-based platforms
   at [docs.pgedge.com](https://docs.pgedge.com/enterprise/el/configure-repo/).

2. Install pgEdge Enterprise Postgres; you'll find instructions at
   [docs.pgedge.com](https://docs.pgedge.com/enterprise/el/installing/).

!!! note

    After installing pgEdge Enterprise Postgres, you can skip manual cluster
    initialization and postmaster startup.  Patroni will perform both steps
    while bootstrapping.

3. Install the required Patroni and etcd packages with the following
   command:

    ```bash
     sudo dnf install pgedge-patroni pgedge-patroni-aws \
     pgedge-patroni-consul pgedge-consul pgedge-patroni-etcd \
     pgedge-python3-etcd pgedge-patroni-zookeeper pgedge-etcd
     ```

3. Verify the installed Patroni version with the following command:

    ```bash
    /usr/bin/patroni --version
    ```

3. Confirm that Python can import the Patroni module with the
   following command:

    ```bash
    python3.12 -c "import patroni; print('OK')"
    ```

## Configuring and Starting etcd

This section describes a single-node test setup for etcd. Use the
following steps to configure and start the etcd service.

1. Open the etcd configuration file for editing:

    ```bash
    sudo vi /etc/etcd/etcd.conf
    ```

2. Add the following settings to the configuration file:

    ```ini
    ETCD_NAME="default"
    ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
    ETCD_LISTEN_CLIENT_URLS="http://localhost:2379"
    ETCD_ADVERTISE_CLIENT_URLS="http://localhost:2379"
    ETCD_ENABLE_V2="true"
    ```

3. Enable and start the etcd service using the following commands:

    ```bash
    sudo systemctl enable etcd
    sudo systemctl start etcd
    sudo systemctl status etcd
    ```

4. Verify that etcd is working using the following command:

    ```bash
    etcdctl endpoint health
    ```

## Configuring and Starting Patroni

Use the following steps to configure and start the Patroni service.

1. Create the Patroni configuration directory and assign ownership to
   the `postgres` user:

    ```bash
    sudo mkdir -p /etc/patroni
    sudo chown postgres:postgres /etc/patroni
    ```

2. Ensure the PostgreSQL `data` directory is empty. Patroni runs `initdb`
   during bootstrap and requires an empty data directory. 
   
   If the directory *does not* exist, use the following commands to create it
   with the correct ownership and permissions:

    ```bash
    sudo mkdir -p /var/lib/pgsql/18/data
    sudo chown -R postgres:postgres /var/lib/pgsql/18
    sudo chmod 700 /var/lib/pgsql/18/data
    ```

   If the directory already exists and contains data from a previous
   PostgreSQL installation, back up any important data and then remove
   the contents of the `data` directory:

    ```bash
    sudo rm -rf /var/lib/pgsql/18/data/*
    ```

3. Stop and disable the PostgreSQL service. Patroni manages PostgreSQL
   directly and must not share control with systemd:

    ```bash
    sudo systemctl stop postgresql-18
    sudo systemctl disable postgresql-18
    ```

4. Create the Patroni configuration file. For details about available
   configuration options, see the
   [Patroni documentation](https://patroni.readthedocs.io/en/latest/):

    ```bash
    sudo -u postgres vi /etc/patroni/patroni.yml
    ```

5. Set the correct ownership and permissions on the configuration file:

    ```bash
    sudo chown postgres:postgres /etc/patroni/patroni.yml
    sudo chmod 600 /etc/patroni/patroni.yml
    ```

6. Enable and start the Patroni service using the following commands:

    ```bash
    sudo systemctl enable patroni
    sudo systemctl start patroni
    sudo systemctl status patroni
    ```
