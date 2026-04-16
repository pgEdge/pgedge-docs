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
Postgres cluster, you need to 
[install and initialize](../installing.md#installing-pgedge-enterprise-postgres-and-controlling-the-cluster) 
the Postgres database; the configuration steps require the location of the 
`data` directory.

## Installing Patroni and etcd

Use the following steps to install Patroni and etcd on a Debian-based
platform.

1. Install the required Patroni and etcd packages with the following command:

    ```bash
    sudo apt-get install pgedge-patroni pgedge-etcd
    ```

3. Verify the installed Patroni version with the following command:

    ```bash
    /usr/bin/patroni --version
    ```

4. Confirm that Python can import the Patroni module with the following
    command:

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

1. Copy the Patroni configuration template and set the required
    ownership and permissions. For details about available configuration
    options, see the
    [Patroni documentation](https://patroni.readthedocs.io/en/latest/):

    ```bash
    sudo cp /etc/patroni/config.yml.in /etc/patroni/config.yml
    sudo chown postgres:postgres /etc/patroni/config.yml
    sudo chmod 600 /etc/patroni/config.yml
    ```

2. Create the PostgreSQL `data` directory and set the required
    permissions:

    ```bash
    sudo mkdir -p /var/lib/pgsql/17/data
    sudo chown -R postgres:postgres /var/lib/pgsql/17
    sudo chmod 700 /var/lib/pgsql/17/data
    ```

3. Stop and disable the PostgreSQL service. Patroni manages PostgreSQL
    directly and must not share control with systemd:

    ```bash
    sudo systemctl stop postgresql-17
    sudo systemctl disable postgresql-17
    ```

4. Enable and start the Patroni service using the following commands:

    ```bash
    sudo systemctl enable patroni
    sudo systemctl start patroni
    sudo systemctl status patroni
    ```