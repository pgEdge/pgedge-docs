# Installing the AI DBA Workbench with RPM Packages

This guide walks you through installing and configuring the pgEdge AI DBA
Workbench on a Linux system using RPM packages. The installation covers
PostgreSQL 18, the Workbench components, and the Nginx web client.


Before you start, ensure:

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
see the [pgEdge documentation](https://docs.pgedge.com/enterprise/).

In the following example, the `dnf` command installs the EPEL release, enables
the CodeReady Builder repository, adds the `pgedge` repository, and installs
the PostgreSQL 18 package.

```bash
sudo dnf install -y epel-release
sudo dnf config-manager --set-enabled crb
sudo dnf install -y \
    https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm
sudo dnf install -y pgedge-enterprise-postgres_18
```

After installing Postgres, initialize the `data` directory and start the
service. In the following example, the `postgresql-18-setup` command
initializes the `data` directory; `systemctl` then starts and enables the
service:

```bash
postgresql-18-setup initdb
systemctl start postgresql-18.service
systemctl enable postgresql-18.service
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

Then, create the datastore database. In the following example, the
`CREATE DATABASE` statement creates the `ai_workbench` database:

```sql
CREATE DATABASE ai_workbench;
```

The collector creates the required schema tables automatically on the
first startup.

!!! hint

    You can use `\q` to exit the `psql` client session and return to the
    terminal window.


## Installing the Workbench Packages

After installing and preparing Postgres, add the Workbench components.
In the following example, the `dnf` command installs all four pgEdge AI DBA
Workbench components and their dependencies:

```bash
dnf install pgedge-ai*
```

The following output shows the packages that `dnf` will install on a
Rocky Linux host:

```bash
Last metadata expiration check: 0:00:21 ago on Fri 10 Apr 2026 08:03:36 PM PKT.
Dependencies resolved.
=============================================================================
 Package                       Arch    Version               Repository  Size
=============================================================================
Installing:
 pgedge-ai-dba-alerter         aarch64 1.0.0-alpha3_1.el10   pgedge     3.6 M
 pgedge-ai-dba-client          noarch  1.0.0-alpha3_1.el10   pgedge-noarch 2.5 M
 pgedge-ai-dba-collector       aarch64 1.0.0-alpha3_1.el10   pgedge     2.7 M
 pgedge-ai-dba-server          aarch64 1.0.0-alpha3_1.el10   pgedge     5.1 M
Installing dependencies:
 nginx                         aarch64 2:1.26.3-2.el10_1     appstream   32 k
 nginx-core                    aarch64 2:1.26.3-2.el10_1     appstream  645 k
 nginx-filesystem              noarch  2:1.26.3-2.el10_1     appstream   10 k
 pgedge-postgres-mcp-kb        aarch64 1.0.0-1.el10          pgedge     332 M
 rocky-logos-httpd             noarch  100.4-7.el10           appstream   24 k

Transaction Summary
=============================================================================
Install  9 Packages

Total download size: 346 M
Installed size: 655 M
Is this ok [y/N]:
```

When prompted, enter `y` to install the packages.


## Configuring the Collector

The collector gathers Postgres metrics and writes them to the
`ai_workbench` database. The steps that follow detail each configuration
task; we will:

- create the `dba_collector` role.
- configure the Collector's YAML file.
- create the secret file.
- start the service.

### Creating the dba_collector Role

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

### Updating the Collector's YAML File

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


### Creating a Secret File and starting the Collector

In the following example, `openssl` generates a random secret and writes
it to `/etc/pgedge/ai-dba-collector.secret`; the `chmod` and `chown`
commands secure the file:

```bash
openssl rand -base64 32 > /etc/pgedge/ai-dba-collector.secret
chmod 600 /etc/pgedge/ai-dba-collector.secret
chown pgedge:pgedge /etc/pgedge/ai-dba-collector.secret
```

Then, use the `systemctl` command to start the Collector service:

```bash
systemctl start pgedge-ai-dba-collector.service
```


## Configuring the Server

The MCP server provides the API layer for the Workbench. The steps that
follow detail each configuration task; we will:

- create the `dba_server` database role.
- configure the server's YAML file.
- create the secret file.
- create an admin user and token.
- start the service.

### Creating the dba_server Role

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

### Configuring the Server's YAML File

Use properties in the configuration file to set the datastore
connection values for the server:

```yaml
datastore:
    host: localhost
    database: ai_workbench
    username: dba_server
    port: 5432
    password: "1safepassword!"
```

If you are running the Workbench on an internal network, you also need to
modify the `allow_internal_networks` property, setting it to `true`:

```yaml
allow_internal_networks: true
```

The DBA Workbench server requires an AI provider for chat, query
analysis, anomaly classification, and embedding generation. The following
property examples use OpenAI as the provider.

Replace the provider, model, and api_key_file values in the server
configuration files with the corresponding settings for your chosen
provider. For Ollama, no API key is required — set ollama_url to your
local Ollama instance URL instead.

```yaml
# ── LLM (Ellie chat + Query/Chart analysis) ───────────────────────────────
llm:
  provider: openai
  model: gpt-4o
  openai_api_key_file: /etc/pgedge/secrets/openai-api-key

# ── Embedding (generate_embedding tool) ───────────────────────────────────
embedding:
  enabled: true
  provider: openai
  model: text-embedding-3-small
  openai_api_key_file: /etc/pgedge/secrets/openai-api-key

# ── Knowledgebase (similarity search in Ellie) ────────────────────────────
knowledgebase:
  enabled: true
  database_path: /usr/share/pgedge/pgedge-ai-kb/kb.db
  embedding_provider: openai
  embedding_model: text-embedding-3-small
  embedding_openai_api_key_file: /etc/pgedge/secrets/openai-api-key
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

### Creating the admin User and SQLite Database

The Workbench uses a SQLite database to store authentication and management
details. In the following example, the `mkdir`, `chown`, and
`ai-dba-server` commands create the directory and add a user; the
`-data-dir` flag places the `auth.db` authentication database in
`/var/lib/ai-workbench/data`:

```bash
sudo mkdir -p /var/lib/ai-workbench/data
sudo chown -R $USER:$USER /var/lib/ai-workbench/data
/opt/ai-workbench/ai-dba-server \
    -add-user -username admin \
    -data-dir /var/lib/ai-workbench/data
```

The command prompts for a password and optional user details; the password
must include at least one capital letter, one digit, and one special
character:

```bash
/opt/ai-workbench/ai-dba-server -add-user -username admin -data-dir /var/lib/ai-workbench/data
Auth store: /var/lib/ai-workbench/data/auth.db
Enter password:
Confirm password:
Enter full name (optional): admin
Enter email address (optional): admin@pgedge.com
Enter notes for this user (optional):

======================================================================
User created successfully!
======================================================================

Username:  admin
Full Name: admin
Email:    admin@pgedge.com
Status:   Enabled
======================================================================
```

Then, grant superuser status to the admin account. In the following
example, the `-set-superuser` flag promotes the `admin` user to
superuser:

```bash
/opt/ai-workbench/ai-dba-server \
    -set-superuser -username admin \
    -data-dir /var/lib/ai-workbench/data
```

The command confirms the change; for example:

```bash
User 'admin' is now a superuser
```

!!! note

    Without superuser privileges, you are allowed to connect to the
    Workbench, but you will not be able to add servers for monitoring.

Next, use the `ai-dba-server` command to create an API token
for the `admin` user:

```bash
sudo runuser -u pgedge -- /usr/bin/ai-dba-server -add-token -data-dir /var/lib/pgedge/ai-dba-server/
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
    Save this token securely; it will not be shown again. You will use it
    in API requests with the header `Authorization: Bearer <token>`.

### Updating the auth.db File Ownership

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


## Configuring the Alerter

The alerter monitors metrics and generates alerts based on configured rules.
The steps that follow detail each configuration task; we will:

- create the dba_alerter database role.
- configure the Alerter's YAML file.
- start the service.

### Creating the dba_alerter Role

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
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_acknowledgments TO dba_alerter;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notification_history TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE notification_history_id_seq TO dba_alerter;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notification_reminder_state TO dba_alerter;
GRANT USAGE, SELECT ON SEQUENCE notification_reminder_state_id_seq TO dba_alerter;
```

### Configuring the Alerter's YAML File

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

The Workbench Alerter requires an AI provider for chat, query
analysis, anomaly classification, and embedding generation. The following
property examples use OpenAI as the provider.

Replace the provider, model, and api_key_file values in the alerter
configuration files with the corresponding settings for your chosen
provider. For Ollama, no API key is required — set `ollama_url` to your
local Ollama instance URL instead.

```yaml
# ── LLM (Ellie chat + Query/Chart analysis) ───────────────────────────────
llm:
  provider: openai
  model: gpt-4o
  openai_api_key_file: /etc/pgedge/secrets/openai-api-key

# ── Embedding (generate_embedding tool) ───────────────────────────────────
embedding:
  enabled: true
  provider: openai
  model: text-embedding-3-small
  openai_api_key_file: /etc/pgedge/secrets/openai-api-key

# ── Knowledgebase (similarity search in Ellie) ────────────────────────────
knowledgebase:
  enabled: true
  database_path: /usr/share/pgedge/pgedge-ai-kb/kb.db
  embedding_provider: openai
  embedding_model: text-embedding-3-small
  embedding_openai_api_key_file: /etc/pgedge/secrets/openai-api-key
```

Then, use the `systemctl` command to start the alerter service:

```bash
systemctl start pgedge-ai-dba-alerter.service
```


## Starting the Web Client

The web client is served by Nginx on port `8444`. The steps below
configure SELinux and start the Nginx service. The `semanage` and
`setsebool` commands update the SELinux policy to allow Nginx to bind to
port 8444; `systemctl` then starts the service:

```bash
semanage port -a -t http_port_t -p tcp 8444
setsebool -P httpd_can_network_connect 1
systemctl start nginx.service
```

After Nginx starts, access the web console at `http://localhost:8444/`;
provide authentication details when the Workbench opens.

![Log in to the AI DBA Workbench](../images/workbench_login.png)

After logging in, select the `+` next to the DATABASE SERVERS heading
in the left navigation panel. The Workbench adds a new server definition
entry.

![Adding a server definition](../images/add_server.png)

For detailed information about using the Workbench, see the
[User Guide](https://docs.pgedge.com/ai-dba-workbench/v1-0-0-beta3/user-guide/).

