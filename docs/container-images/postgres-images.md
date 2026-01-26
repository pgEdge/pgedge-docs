# pgEdge Enterprise Postgres Images

pgEdge provides Postgres container images that you can utilize across your deployments, whether in a single region or distributed with Spock multi-master replication.

These container images are built directly from [pgEdge Enterprise Postgres](../enterprise/index.md) packages, the same packages used for VM and bare-metal deployments. 

This approach ensures consistent behavior across all deployment targets: whether you run pgEdge on Kubernetes, Docker, or directly on a host, you get the same tested PostgreSQL distribution with the same extensions and configurations.

Each image comes with pgEdge and community extensions pre-installed and ready to use, eliminating manual setup and ensuring compatibility between components. 

Images are built from pgEdge Enterprise Postgres packages using Rocky Linux 9 UBI as the base image.

Images are published on the [pgEdge Container Registry](https://github.com/orgs/pgEdge/packages/container/package/pgedge-postgres) and are managed via the [pgedge/postgres-images](https://github.com/pgEdge/postgres-images) project.

You can pull the latest standard image for Postgres 18:

```bash
docker pull ghcr.io/pgedge/pgedge-postgres:18-spock5-standard
```

## Image Flavors

There are two supported image flavors: **minimal** and **standard**.

### Minimal Images

Minimal images contain PostgreSQL and the core pgEdge extensions:

| Component | Type | Description |
|-----------|------|-------------|
| Spock | Extension | Multi-master logical replication |
| lolor | Extension | Large Object Logical Replication |
| snowflake | Extension | Distributed unique ID generation |

### Standard Images

Standard images include everything in minimal, plus additional extensions and tools:

| Component | Type | Description |
|-----------|------|-------------|
| pgAudit | Extension | Session and object audit logging |
| PostGIS | Extension | Spatial and geographic objects |
| pgVector | Extension | Vector similarity search |
| pgEdge Vectorizer | Extension | Automated embedding generation |
| pg_tokenizer | Extension | Text tokenization for search |
| vchord_bm25 | Extension | BM25 ranking for full-text search |
| pg_vectorize | Extension | Vector search utilities |
| pgmq | Extension | Lightweight message queue |
| pg_cron | Extension | Time-based job scheduler |
| pg_stat_monitor | Extension | Query performance monitoring |
| Patroni | Tool | HA cluster management |
| pgBackRest | Tool | Backup and restore |
| psycopg2 | Tool | Python PostgreSQL adapter |

## Image Tags

Tags follow this naming convention:

| Format | Example | Description |
|--------|---------|-------------|
| `{pg-major}-spock{spock-major}-{flavor}` | `17-spock5-standard` | Latest patch for PG major + Spock major |
| `{pg-major.minor}-spock{spock-major}-{flavor}` | `17.6-spock5-standard` | Latest patch for PG minor + Spock major |
| `{pg-major.minor}-spock{spock-major.minor.patch}-{flavor}-{epoch}` | `17.6-spock5.0.4-standard-1` | Immutable, fully pinned version |

**Available PostgreSQL versions:** 16, 17, 18

## Supported Architectures

Images are built for both architectures:

- `amd64` (x86_64)
- `arm64` (Apple Silicon, AWS Graviton)

## Entry Points

### Default Entry Point

The default entry point is based on the [official PostgreSQL image](https://github.com/docker-library/docs/blob/master/postgres/README.md). It supports:

- Automatic database initialization
- Custom initialization scripts via `/docker-entrypoint-initdb.d/`
- Environment variable configuration

!!! note
    Running the container as root is not currently supported.

### Patroni Entry Point

Standard images include Patroni for high availability deployments:

```bash
docker run -d \
  --entrypoint /usr/local/bin/patroni \
  ghcr.io/pgedge/pgedge-postgres:17-spock5-standard \
  /path/to/patroni.yml
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Superuser username | `postgres` |
| `POSTGRES_PASSWORD` | Superuser password | (required) |
| `POSTGRES_DB` | Default database name | Same as `POSTGRES_USER` |
| `PGDATA` | Data directory path | `/var/lib/pgsql/{version}/data` |

## Data Volumes

The image is compatible with Docker volumes and bind mounts. Because PostgreSQL
requires the data directory to be owned by the `postgres` user, specify `PGDATA`
as a subdirectory of the volume mount.

**Recommended configuration:**

- Volume mount point: `/var/lib/pgsql`
- Data directory (`PGDATA`): `/var/lib/pgsql/{pg_major_version}/data`

## Quick Start

Run a single PostgreSQL instance:

```bash
docker run --name pgedge-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_USER=admin \
  -e POSTGRES_DB=example_db \
  -p 6432:5432 \
  -d ghcr.io/pgedge/pgedge-postgres:18-spock5-standard
```

Connect with `psql`:

```bash
docker exec -it pgedge-postgres psql -U admin example_db
```

## Examples

The repository includes Docker Compose examples:

- [Enterprise Example](https://github.com/pgEdge/postgres-images/tree/main/examples/compose/enterprise) - Single instance with extensions initialized
- [Distributed Example](https://github.com/pgEdge/postgres-images/tree/main/examples/compose/distributed) - Two-node cluster with Spock replication pre-configured