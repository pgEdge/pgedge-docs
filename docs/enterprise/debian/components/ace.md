# Installing and Configuring ACE

ACE (Active Consistency Engine) is designed to ensure and maintain data
consistency across nodes in a distributed pgEdge Distributed Postgres
cluster. ACE identifies and resolves data inconsistencies, schema
differences, and replication configuration mismatches across cluster
nodes.

## Installing ACE

This section describes installation and the files the package installs
on Debian-based platforms.

ACE supports Debian 11 (Bullseye), Debian 12 (Bookworm), Debian 13
(Trixie), Ubuntu 22.04 (Jammy), and Ubuntu 24.04 (Noble). Use the
following command to install ACE:

```bash
sudo apt-get install pgedge-ace
```

The following table describes the files and directories the package
creates:

| Path | Description |
|------|-------------|
| `/usr/bin/ace` | ACE binary |
| `/etc/systemd/system/pgedge-ace.service` | systemd service file |
| `/var/log/pgedge/ace` | ACE log directory |
| `/var/lib/pgedge/ace` | ACE configuration directory |

## Initializing ACE

Before starting the ACE service, initialize the configuration files.
Run the following commands to generate the default configuration
templates:

```bash
ace cluster init --path /var/lib/pgedge/ace/pg_service.conf
ace config init  --path /var/lib/pgedge/ace/ace.yaml
```

The following table describes the two files the commands create:

| File | Purpose |
|------|---------|
| `pg_service.conf` | Cluster and node connection definitions |
| `ace.yaml` | ACE runtime configuration |

!!! note
    ACE looks for `ace.yaml` in the working directory by default. Since
    the service runs from `/var/lib/pgedge/ace/`, always initialize
    configuration files in that directory.

## Configuring ACE

This section describes the two configuration files that control ACE
behavior.

### pg_service.conf

The `pg_service.conf` file defines your cluster and nodes. The file
follows PostgreSQL service file format. Each cluster has a base section
and one section per node named `<cluster>.<node>`. In the following
example, the configuration defines a two-node cluster named `prod`:

```ini
[prod]
dbname=mydb
user=aceuser
password=yourpassword

[prod.n1]
host=10.0.0.1
port=5432

[prod.n2]
host=10.0.0.2
port=5432
```

### ace.yaml

The `ace.yaml` file controls ACE runtime behavior. In the following
example, the configuration shows the key settings to review after
initialization:

```yaml
pg_service_file: /var/lib/pgedge/ace/pg_service.conf
default_cluster: demo
max_cpu_ratio: 0.6
block_rows: 10000
```

For automated scheduled jobs, add `schedule_jobs` and `schedule_config`
sections to `ace.yaml`. See the
[ACE documentation](https://docs.pgedge.com/ace/) for details about
scheduling options.

## Starting the ACE Service

Once the configuration files are in place, use the following steps to
enable and start the ACE service.

1. Enable the ACE service to start on boot:

    ```bash
    sudo systemctl enable pgedge-ace
    ```

2. Start the ACE service:

    ```bash
    sudo systemctl start pgedge-ace
    ```

3. Check the service status:

    ```bash
    sudo systemctl status pgedge-ace
    ```

All ACE service logs are written to `/var/log/pgedge/ace/ace.log`. Use
the following command to follow the logs in real time:

```bash
tail -f /var/log/pgedge/ace/ace.log
```

## Verifying the Installation

Run a table diff against your cluster to confirm ACE can connect to all
nodes:

```bash
cd /var/lib/pgedge/ace
ace table-diff demo public.your_table
```

## Troubleshooting

This section describes common errors and their resolutions.

### The 'ace.yaml' configuration file is not found

ACE looks for `ace.yaml` in the current working directory. Run ACE from
`/var/lib/pgedge/ace/` or specify the path explicitly using the
`--config` flag.

### The pgcrypto extension is not available

Install the PostgreSQL contrib package with the following command:

```bash
sudo apt-get install postgresql-contrib
```

After installing the contrib package, re-run the command with
`--ensure-pgcrypto`.

### Can not retrieve commit timestamp data

Enable commit timestamp tracking and restart PostgreSQL on all nodes:

```bash
sudo -u postgres psql -c "ALTER SYSTEM SET track_commit_timestamp = on;"
sudo systemctl restart postgresql
```

### Subscription worker not streaming (pid is NULL)

This error usually indicates a replication conflict. Check the
PostgreSQL logs with the following command:

```bash
sudo tail -50 /var/log/postgresql/$(ls -t /var/log/postgresql/ | head -1)
```

Recreate the subscription with `origin = none` to prevent replication
loops:

```sql
ALTER SUBSCRIPTION sub_from_node2 DISABLE;
ALTER SUBSCRIPTION sub_from_node2 SET (slot_name = NONE);
DROP SUBSCRIPTION sub_from_node2;

CREATE SUBSCRIPTION sub_from_node2
    CONNECTION 'host=127.0.0.1 port=5433 dbname=postgres user=postgres'
    PUBLICATION pub_node2
    WITH (copy_data = false, connect = true, origin = none);
```

## Resources

The following resources provide additional information about installing
and using ACE:

- The [ACE GitHub repository](https://github.com/pgEdge/ace) contains
  the source code and issue tracker.
- The [ACE documentation](https://docs.pgedge.com/ace/) describes all
  commands and configuration options.
- The [ACE release notes](https://docs.pgedge.com/ace/CHANGELOG/)
  describe changes by version.
