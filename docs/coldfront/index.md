# ColdFront

ColdFront is a transparent data tiering and partition lifecycle
management tool for PostgreSQL. It keeps recent data in native
PostgreSQL range partitions and automatically moves older data to
Apache Iceberg on any S3-compatible object store. Applications use
standard SQL against the same table name for all reads and writes;
no SQL changes are required after setup.

ColdFront is a pgEdge Labs project. The source code is available at
the [pgEdge ColdFront GitHub repository](https://github.com/pgEdge/ColdFront).

## How It Works

ColdFront replaces a partitioned table with a unified view backed by
two storage tiers. A small C extension intercepts DML on the view and
routes each statement to the correct tier automatically. A static Go
archiver binary moves expired PostgreSQL partitions to Iceberg on a
cron schedule and advances the hot/cold watermark. The ColdFront stack
includes the following components:

- PostgreSQL 16, 17, or 18 (stock open-source packages; no fork or
  patched build required).
- the `coldfront` C extension, which intercepts DML on tiered views
  and rewrites it to the correct tier.
- the `pg_duckdb` extension, which enables in-process Iceberg reads
  via the DuckDB engine.
- Lakekeeper, an Apache-licensed Iceberg REST catalog Rust binary.
- an S3-compatible object store for Parquet data files and Iceberg
  metadata.
- the ColdFront archiver, a static Go binary (~9 MB, no CGO) that
  runs from cron.

## Operating Modes

ColdFront supports three operating modes. The mode is selected per
table at creation time; all three can coexist in the same database.

### Tiered Mode

Tiered mode keeps recent rows in native PostgreSQL range partitions
and archives older partitions to Apache Iceberg. The archiver runs on
a cron schedule and moves partitions that exceed the configured
`hot_period` to the cold tier. A unified view named after the original
table gives applications transparent read and write access to both
tiers. This mode suits workloads with a recent-row OLTP pattern where
older rows are queried infrequently.

### Decoupled Mode

Decoupled mode stores all rows in Iceberg from the first insert. A
single SQL function call provisions the Iceberg table, a PostgreSQL
wrapper view, and the registry entry that arms the coldfront hook for
every DML statement on the view. No archiver is required. This mode
suits append-mostly analytic workloads where eliminating PostgreSQL
heap storage entirely is the goal.

### Standalone Partition Manager

The standalone partition manager automates PostgreSQL partition
lifecycle management without any cold tier or Iceberg components. It
preallocates forward partitions, detaches and drops expired ones using
`DETACH CONCURRENTLY`, and enforces a configurable retention period.
This mode runs on any PostgreSQL instance, including pgEdge Spock mesh
deployments.

## Prerequisites

Tiered and decoupled modes require the full stack. The standalone
partition manager requires only PostgreSQL. The following table
describes the component requirements per mode:

| Component | Tiered | Decoupled | Standalone |
|---|---|---|---|
| PostgreSQL 16, 17, or 18 | Required | Required | Required |
| coldfront extension | Required | Required | Not used |
| pg_duckdb extension | Required | Required | Not used |
| Lakekeeper | Required | Required | Not used |
| S3-compatible storage | Required | Required | Not used |
| ColdFront archiver binary | Required | Not used | Required |

## Configuration

ColdFront reads its configuration from a YAML file. The following
example shows a minimal tiered mode configuration:

```yaml
postgres:
  dsn: "host=localhost port=5432 dbname=mydb user=myuser sslmode=disable"

iceberg:
  warehouse: "wh"
  lakekeeper_endpoint: "http://lakekeeper:8181/catalog"
  namespace: "default"

s3:
  endpoint: "seaweedfs:8333"
  region: "us-east-1"
  access_key: "admin"
  secret_key: "adminsecret"

archiver:
  tables:
    - source_table: "events"
      partition_period: "monthly"
      hot_period: "3 months"
      # retention_period: "5 years"   # optional; omit to keep cold data forever
```

The following table describes the key configuration settings:

| Setting | Description |
|---|---|
| `postgres.dsn` | PostgreSQL connection string for the archiver. |
| `iceberg.warehouse` | Lakekeeper warehouse name. |
| `iceberg.lakekeeper_endpoint` | Lakekeeper REST catalog URL. |
| `iceberg.namespace` | Iceberg namespace; defaults to "default". |
| `s3.endpoint` | S3-compatible storage endpoint without the `http://` prefix. |
| `archiver.tables[].source_table` | Name of the partitioned table to manage. |
| `archiver.tables[].partition_period` | Partition granularity: "monthly" or "daily". |
| `archiver.tables[].hot_period` | Age threshold at which partitions move to the cold tier. |
| `archiver.tables[].retention_period` | Age threshold at which cold data is dropped; optional. |

## Next Steps

The following resources provide additional information about ColdFront:

- The [ColdFront README](https://github.com/pgEdge/ColdFront/blob/main/README.md)
  provides a complete quickstart guide and infrastructure setup steps
  using Docker Compose.
- The [USAGE.md guide](https://github.com/pgEdge/ColdFront/blob/main/USAGE.md)
  covers all three operating modes with SQL examples and full archiver
  configuration reference.
- The [10,000-foot view](https://github.com/pgEdge/ColdFront/blob/main/10000_FT_VIEW.md)
  explains the design rationale, trade-offs, and comparisons with
  similar tools.
