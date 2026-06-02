# Installing the AI DBA Workbench with DEB Packages

This guide walks you through installing and configuring the pgEdge AI DBA
Workbench on a Linux system using DEB packages. In our example, we'll be
installating PostgreSQL 18, the Workbench components, and the Nginx web
client.

Before starting, ensure:

- The target host runs a compatible x86_64 (amd64) or arm64 operating system
  on Linux.
- You have `root` or `sudo` access on the target system.
- Your native package manager is available and the host has internet
  access.
- Network access exists between each monitored Postgres server and the system
  hosting the Workbench.

## Installing and Configuring Postgres

Before installing the Workbench, you need to install and enable the `pgedge`
repository.  For detailed instructions for all of the supported platforms,
see the [documentation](../configure-repo.md).

In the following example, we use the `apt` command to add the `pgedge`
repository and installs the PostgreSQL 18 package:

```bash
sudo apt install -y curl
curl -fsSL https://apt.pgedge.com/pgedge.gpg \
    | sudo gpg --dearmor -o /usr/share/keyrings/pgedge.gpg
echo "deb [signed-by=/usr/share/keyrings/pgedge.gpg] \
    https://apt.pgedge.com bookworm main" \
    | sudo tee /etc/apt/sources.list.d/pgedge.list
sudo apt update
sudo apt install -y pgedge-enterprise-postgres_18
```

On Debian, the PostgreSQL package automatically initializes the `data`
directory. When the installation completes, we can use the `systemctl` command
to start and enable the service:

```bash
systemctl start postgresql@18-main.service
systemctl enable postgresql@18-main.service
```

After initializing Postgres, connect to the server and modify the postgres
role, adding a password. In the following example, the `psql` command
connects to the database:

```bash
sudo -u postgres psql -U postgres -p 5432
```

In the following example, the `psql` command opens a session as the
`postgres` user; the `ALTER ROLE` statement sets the password:

```sql
ALTER ROLE postgres PASSWORD '1safepassword!';
```


## Installing the Workbench Packages

After installing and preparing Postgres, add the Workbench components.
In the following example, the `apt` command installs all four pgEdge AI
DBA Workbench components and their dependencies:

```bash
sudo apt install pgedge-ai*
```

The following output shows the packages that `apt` will install on a
Debian host:

```bash
Reading package lists... Done
Building dependency tree... Done
The following additional packages will be installed:
  nginx pgedge-postgres-mcp-kb
The following NEW packages will be installed:
  nginx pgedge-ai-dba-alerter pgedge-ai-dba-client
  pgedge-ai-dba-collector pgedge-ai-dba-server
  pgedge-postgres-mcp-kb
0 upgraded, 6 newly installed, 0 to remove and 0 not upgraded.
Need to get 346 MB of archives.
After this operation, 655 MB of additional disk space will be used.
Do you want to continue? [Y/n]
```

When prompted, press `Enter` or type `y` to install the packages.


### Creating the Workbench Database

In the following example, the `createdb` command creates the `ai_workbench`
database as the `postgres` OS user:

```bash
su - postgres
createdb ai_workbench
```

## Configuring the Collector

The collector gathers Postgres metrics and writes them to the
`ai_workbench` database. The steps that follow cover each configuration
task:

- The first step creates the required database role.
- The second step configures the YAML file.
- The third step creates the secret file.
- The fourth step starts the service.

### Creating a Database Role

In the following example, SQL statements connect to the `ai_workbench`
database, create the `dba_collector` role, and grant the permissions that
the collector requires:

```sql
\c ai_workbench

-- Create extension first as superuser (postgres)
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure schemas exist
CREATE SCHEMA IF NOT EXISTS metrics;

CREATE ROLE dba_collector WITH LOGIN PASSWORD '1safepassword!';

-- Transfer ownership
ALTER SCHEMA metrics OWNER TO dba_collector;

-- Grant database-level CREATE
GRANT CREATE ON DATABASE ai_workbench TO dba_collector;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO dba_collector;
GRANT ALL ON SCHEMA metrics TO dba_collector;

-- Grant on existing tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO dba_collector;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO dba_collector;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO dba_collector;
ALTER DEFAULT PRIVILEGES IN SCHEMA metrics
    GRANT ALL ON TABLES TO dba_collector;
```

### Configuring the YAML File

In the following example, the `vi` command opens the collector
configuration file at `/etc/pgedge/ai-dba-collector.yaml`:

```bash
vi /etc/pgedge/ai-dba-collector.yaml
```

In the following example, the configuration file sets the datastore
connection values:

```yaml
datastore:
  # Hostname or IP address of the AI DBA Workbench datastore PostgreSQL
  # server. Default: localhost. Command-line: -pg-host
  host: localhost

database: ai_workbench
Username: dba_collector
port: 5432
sslmode: disable
password: 1safepassword!
```

### Creating a Secret File

In the following example, `openssl` generates a random secret and writes
it to `/etc/pgedge/ai-dba-collector.secret`; the `chmod` and `chown`
commands secure the file:

```bash
openssl rand -base64 32 > /etc/pgedge/ai-dba-collector.secret
chmod 600 /etc/pgedge/ai-dba-collector.secret
chown pgedge:pgedge /etc/pgedge/ai-dba-collector.secret
```

In the following example, the `systemctl` command starts the collector
service:

```bash
systemctl start pgedge-ai-dba-collector.service
```

### Verifying the Installation

After the collector starts, connect to the `ai_workbench` database and run
`\dt metrics.*` to confirm that the metrics tables have been created. The
following sample output shows the expected tables:

```bash
\dt metrics.*
                               List of tables
 Schema  |             Name             |       Type        |     Owner
---------+------------------------------+-------------------+---------------
 metrics | pg_connectivity              | partitioned table | dba_collector
 metrics | pg_database                  | partitioned table | dba_collector
 metrics | pg_extension                 | partitioned table | dba_collector
 metrics | pg_hba_file_rules            | partitioned table | dba_collector
 metrics | pg_ident_file_mappings       | partitioned table | dba_collector
 metrics | pg_node_role                 | partitioned table | dba_collector
 metrics | pg_replication_slots         | partitioned table | dba_collector
 metrics | pg_server_info               | partitioned table | dba_collector
 metrics | pg_settings                  | partitioned table | dba_collector
 metrics | pg_stat_activity             | partitioned table | dba_collector
 metrics | pg_stat_all_indexes          | partitioned table | dba_collector
 metrics | pg_stat_all_tables           | partitioned table | dba_collector
 metrics | pg_stat_checkpointer         | partitioned table | dba_collector
 metrics | pg_stat_connection_security  | partitioned table | dba_collector
 metrics | pg_stat_database             | partitioned table | dba_collector
 metrics | pg_stat_database_conflicts   | partitioned table | dba_collector
 metrics | pg_stat_io                   | partitioned table | dba_collector
 metrics | pg_stat_recovery_prefetch    | partitioned table | dba_collector
 metrics | pg_stat_replication          | partitioned table | dba_collector
 metrics | pg_stat_statements           | partitioned table | dba_collector
 metrics | pg_stat_subscription         | partitioned table | dba_collector
 metrics | pg_stat_user_functions       | partitioned table | dba_collector
 metrics | pg_stat_wal                  | partitioned table | dba_collector
 metrics | pg_statio_all_sequences      | partitioned table | dba_collector
 metrics | pg_sys_cpu_info              | partitioned table | dba_collector
 metrics | pg_sys_cpu_memory_by_process | partitioned table | dba_collector
 metrics | pg_sys_cpu_usage_info        | partitioned table | dba_collector
 metrics | pg_sys_disk_info             | partitioned table | dba_collector
 metrics | pg_sys_io_analysis_info      | partitioned table | dba_collector
 metrics | pg_sys_load_avg_info         | partitioned table | dba_collector
 metrics | pg_sys_memory_info           | partitioned table | dba_collector
 metrics | pg_sys_network_info          | partitioned table | dba_collector
 metrics | pg_sys_os_info               | partitioned table | dba_collector
 metrics | pg_sys_process_info          | partitioned table | dba_collector
(34 rows)
```

## Configuring the Server

The MCP server provides the API layer for the Workbench. The steps that
follow cover each configuration task:

- The first step creates the required database role.
- The second step configures the YAML file.
- The third step creates the secret file.
- The fourth step creates an admin user and token.
- The fifth step starts the service.

### Creating a Database Role

In the following example, SQL statements connect to the `ai_workbench`
database, create the `dba_server` role, and grant the permissions that the
server requires:

```sql
\c ai_workbench

-- Create the dba_server role
CREATE USER dba_server WITH PASSWORD '1safepassword!';

-- Grant USAGE on schemas
GRANT USAGE ON SCHEMA public TO dba_server;
GRANT USAGE ON SCHEMA metrics TO dba_server;

-- ============================================
-- PUBLIC SCHEMA - Tables with full CRUD access
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE connections TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE clusters TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cluster_groups TO dba_server;
GRANT SELECT, INSERT, DELETE ON TABLE cluster_node_relationships
    TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE probe_configs TO dba_server;
GRANT SELECT, UPDATE ON TABLE alert_rules TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE alert_thresholds
    TO dba_server;
GRANT SELECT, UPDATE ON TABLE alerts TO dba_server;
GRANT SELECT, INSERT ON TABLE alert_acknowledgments TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE blackouts TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE blackout_schedules
    TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notification_channels
    TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE notification_channel_overrides TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE email_recipients
    TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversations TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE chat_memories TO dba_server;

-- ============================================
-- PUBLIC SCHEMA - Read-only tables
-- ============================================
GRANT SELECT ON TABLE schema_version TO dba_server;
GRANT SELECT ON TABLE alerter_settings TO dba_server;
GRANT SELECT ON TABLE probe_availability TO dba_server;
GRANT SELECT ON TABLE metric_definitions TO dba_server;
GRANT SELECT ON TABLE metric_baselines TO dba_server;
GRANT SELECT ON TABLE correlation_groups TO dba_server;
GRANT SELECT ON TABLE anomaly_candidates TO dba_server;
GRANT SELECT ON TABLE connection_notification_channels TO dba_server;
GRANT SELECT ON TABLE notification_history TO dba_server;
GRANT SELECT ON TABLE notification_reminder_state TO dba_server;

-- ============================================
-- METRICS SCHEMA - All read-only
-- ============================================
GRANT SELECT ON ALL TABLES IN SCHEMA metrics TO dba_server;

-- For future metrics tables
ALTER DEFAULT PRIVILEGES IN SCHEMA metrics
    GRANT SELECT ON TABLES TO dba_server;

-- ============================================
-- SEQUENCE PERMISSIONS
-- ============================================
GRANT USAGE ON SEQUENCE connections_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE clusters_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE cluster_groups_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE cluster_node_relationships_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE probe_configs_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE alert_thresholds_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE alert_acknowledgments_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE blackouts_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE blackout_schedules_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE notification_channels_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE notification_channel_overrides_id_seq
    TO dba_server;
GRANT USAGE ON SEQUENCE email_recipients_id_seq TO dba_server;
GRANT USAGE ON SEQUENCE chat_memories_id_seq TO dba_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_acknowledgments
    TO dba_server;
```

### Configuring the YAML File

In the following example, the `vi` command opens the server configuration
file at `/etc/pgedge/ai-dba-server.yaml`:

```bash
vi /etc/pgedge/ai-dba-server.yaml
```

In the following example, the configuration file sets the required
database connection values:

```yaml
database:
  # Database host
  # Default: localhost
  host: "localhost"

  # Database port
  # Default: 5432
  port: 5432

  # Database name
  # Default: postgres
  database: "ai_workbench"

  # Database user
  # Required - there is no default
  user: "dba_server"

  # Database password
  # If not set, will use .pgpass file automatically
  password: "1safepassword!"

  # SSL mode: disable, require, verify-ca, verify-full
  # Default: prefer
  sslmode: "disable"

  allow_internal_networks: true
```

### Creating a Secret File

The MCP server uses the same shared secret as the collector. In the
following example, the `cp` command copies the collector secret to the
server secret path; `chown` and `chmod` secure the file:

```bash
cp /etc/pgedge/ai-dba-collector.secret /etc/pgedge/ai-dba-server.secret
chown pgedge:pgedge /etc/pgedge/ai-dba-server.secret
chmod 600 /etc/pgedge/ai-dba-server.secret
```

### Creating an Admin User and Token

In the following example, the `ai-dba-server` command creates an admin
user in the `/var/lib/pgedge/ai-dba-server/` directory:

```bash
/usr/bin/ai-dba-server -add-user -username admin \
    -data-dir /var/lib/pgedge/ai-dba-server/
```

The command prompts for a password and optional details; the following
sample output shows a successful user creation:

```bash
Enter password:
Confirm password:
Enter full name (optional):
Enter email address (optional):
Enter notes for this user (optional):

======================================================================
User created successfully!
======================================================================

Username:  admin
Status:   Enabled
======================================================================
```

Next, use the `ai-dba-server` command to create an API token
for the `admin` user:

```bash
/usr/bin/ai-dba-server -add-token \
    -data-dir /var/lib/pgedge/ai-dba-server/
```

The command prompts for the token owner's name and optional settings;
the following sample output shows the generated token:

```bash
Enter owner username: admin
Enter notes for this token (optional):
Enter expiry duration (e.g., '30d', '1y', or 'never'):

======================================================================
Token created successfully!
======================================================================

Token: VyGrZzGFUdiZeLZcCTrMR3Nnh2LrqyckpAcmpxlU0=
Hash:  4a066989f77d9e6...
ID:    1
Owner: admin
Expires: Never
======================================================================
```

!!! important
    Save this token securely; it will not be shown again. You will use it in
    API requests with the header `Authorization: Bearer <token>`.

### Granting Superuser Privileges

In the following example, the `ai-dba-server` command grants superuser
privileges to the `admin` user:

```bash
/usr/bin/ai-dba-server -set-superuser -username admin \
    -data-dir /var/lib/pgedge/ai-dba-server/
```

The following sample output confirms the privilege change:

```bash
User 'admin' is now a superuser
```

### Fixing the auth.db Ownership

The `auth.db` file must be owned by the `pgedge` user before the service
starts. In the following example, the `chown` command corrects the
ownership:

```bash
chown pgedge:pgedge /var/lib/pgedge/ai-dba-server/auth.db
```

In the following example, the `ls` command lists the `data` directory to
confirm that the files are present and correctly owned:

```bash
ls -lrt /var/lib/pgedge/ai-dba-server/
```

The following sample output shows the expected files:

```bash
total 1104
-rw------- 1 pgedge pgedge    4096 Apr 10 18:13 auth.db
-rw-r--r-- 1 pgedge pgedge 1091832 Apr 10 18:50 auth.db-wal
-rw-r--r-- 1 pgedge pgedge   32768 Apr 10 18:50 auth.db-shm
```

Then, use the following command to start the MCP server service:

```bash
systemctl start pgedge-ai-dba-server.service
```

### Server Management Tables

The MCP server requires the following tables in the `ai_workbench` database
for configuration and management:

- The `connections` table stores registered database connection definitions.
- The `probe_configs` table stores probe configuration records.
- The `alert_rules` table stores alert rule definitions.
- The `alert_thresholds` table stores threshold values for alert rules.
- The `clusters` table stores cluster definitions.
- The `cluster_groups` table stores cluster group definitions.
- The `cluster_node_relationships` table maps cluster topology and node
  membership.
- The `blackout_schedules` table stores scheduled maintenance window
  definitions.
- The `blackouts` table tracks active blackout periods.
- The `notification_channels` table stores notification channel
  configurations.
- The `email_recipients` table stores email recipient addresses for alerts.
- The `connection_notification_channels` table maps connections to their
  notification channels.
- The `notification_channel_overrides` table stores per-connection channel
  override settings.
- The `correlation_groups` table stores metric correlation group definitions.
- The `metric_definitions` table stores metadata describing each metric.
- The `conversations` table stores chat conversation history.
- The `chat_memories` table stores chat memory and context for the AI
  assistant.

## Configuring the Alerter

The alerter monitors metrics and generates alerts based on configured rules.
The following steps cover each configuration task:

- The first step creates the required database role.
- The second step configures the YAML file.
- The third step starts the service.

### Creating a Database Role

In the following example, SQL statements connect to the `ai_workbench`
database, create the `dba_alerter` role, and grant the permissions that
the alerter requires:

```sql
-- Create the alerter user
CREATE USER dba_alerter WITH PASSWORD '1safepassword!';

-- Schema access
GRANT USAGE ON SCHEMA public TO dba_alerter;
GRANT USAGE ON SCHEMA metrics TO dba_alerter;

-- ============================================
-- METRICS SCHEMA - Read-only
-- ============================================
GRANT SELECT ON ALL TABLES IN SCHEMA metrics TO dba_alerter;
ALTER DEFAULT PRIVILEGES IN SCHEMA metrics
    GRANT SELECT ON TABLES TO dba_alerter;

-- ============================================
-- PUBLIC SCHEMA - Read-only tables
-- ============================================
GRANT SELECT ON TABLE connections TO dba_alerter;
GRANT SELECT ON TABLE clusters TO dba_alerter;
GRANT SELECT ON TABLE alerter_settings TO dba_alerter;
GRANT SELECT ON TABLE alert_rules TO dba_alerter;
GRANT SELECT ON TABLE alert_thresholds TO dba_alerter;
GRANT SELECT ON TABLE blackout_schedules TO dba_alerter;
GRANT SELECT ON TABLE probe_availability TO dba_alerter;
GRANT SELECT ON TABLE probe_configs TO dba_alerter;
GRANT SELECT ON TABLE notification_channel_overrides TO dba_alerter;
GRANT SELECT ON TABLE alert_acknowledgments TO dba_alerter;
GRANT SELECT ON TABLE blackouts TO dba_alerter;

-- ============================================
-- PUBLIC SCHEMA - Read/Write tables
-- ============================================

-- alerts: Full CRUD (create, clear, cleanup old alerts)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE alerts TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE alerts_id_seq TO dba_alerter;

-- anomaly_candidates: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE anomaly_candidates
    TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE anomaly_candidates_id_seq TO dba_alerter;

-- anomaly_embeddings: Upsert
GRANT SELECT, INSERT, UPDATE ON TABLE anomaly_embeddings TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE anomaly_embeddings_id_seq TO dba_alerter;

-- metric_baselines: Upsert
GRANT SELECT, INSERT, UPDATE ON TABLE metric_baselines TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE metric_baselines_id_seq TO dba_alerter;

-- blackouts: Create scheduled blackouts
GRANT SELECT, INSERT ON TABLE blackouts TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE blackouts_id_seq TO dba_alerter;

-- notification_channels: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notification_channels
    TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE notification_channels_id_seq
    TO dba_alerter;

-- notification_history: Track notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_acknowledgments
    TO dba_alerter;
```

### Configuring the YAML File

In the following example, the `vi` command opens the alerter configuration
file for editing:

```bash
vi /etc/pgedge/ai-dba-alerter.yaml
```

In the following example, the configuration file sets the datastore
connection values for the alerter:

```yaml
datastore:
    host: localhost
    database: ai_workbench
    username: dba_alerter
    port: 5432
    password: "1safepassword!"
```

In the following example, the `systemctl` command starts the alerter
service:

```bash
systemctl start pgedge-ai-dba-alerter.service
```

### Alerter Runtime Tables

The alerter uses the following tables in the `ai_workbench` database for
runtime alert and notification data:

- The `alerts` table stores generated alert instances.
- The `alert_acknowledgments` table stores alert acknowledgment records.
- The `notification_history` table logs notification delivery attempts.
- The `notification_reminder_state` table tracks reminder state for
  unresolved alerts.
- The `alerter_settings` table stores alerter runtime configuration.
- The `metric_baselines` table stores calculated baseline values for
  metrics.
- The `anomaly_candidates` table stores detected anomaly candidate records.
- The `anomaly_embeddings` table stores embeddings used for anomaly
  detection.

## Starting the Web Client

The web client is served by Nginx on port `8444`. In the following
example, the `systemctl` command starts the Nginx service:

```bash
systemctl start nginx.service
```

After Nginx starts, access the web console at `http://localhost:8444/`.

