---
hide:
  - toc
  - navigation
---

# Welcome to pgEdge Documentation

pgEdge Enterprise Postgres and pgEdge Distributed Postgres bring advanced multi-master database capabilities to the network edge, enabling low-latency and high availability for modern workloads.

## Product Suite Documentation

* [pgEdge Enterprise Postgres](enterprise/index.md): An enterprise ready Postgres distribution for VMs and bare metal.
* [pgEdge Distributed Postgres](platform/index.md): Multi-master Postgres for VMs and bare metal.
* [pgEdge Cloud](cloud/index.md): Deploy single node or fully-distributed Postgres in the Cloud.
* [pgEdge Container](pgedge-container/index.md): Container images and Kubernetes tooling for deploying pgEdge Enterprise Postgres.

## Component Documentation

* [PostgreSQL](postgresql/index.md): The World's Most Advanced Open-Source Database.
* [pgAdmin 4](pgadmin-4/index.md): Feature-rich, open-source administration and development platform for PostgreSQL.
* [ACE (Active Consistency Engine)](ace/index.md): Data integrity for replicating clusters.
* [Control Plane](control-plane/index.md): A distributed application that provides a declarative API to deploy and manage Postgres databases.
* [lolor](lolor/index.md): A large object replication extension for Postgres.
* [pgEdge Helm](pgedge-helm/index.md): Helm chart for deploying pgEdge Enterprise Postgres clusters on Kubernetes.
* [Snowflake](snowflake/index.md): Cluster-wide unique (Snowflake) sequence extension for Postgres.
* [Spock v5](spock-v5/index.md): Multi-master replication for Postgres.
* [pgBackRest](pgbackrest/index.md): Reliable PostgreSQL Backup & Restore.
* [PgBouncer](pgbouncer/index.md): Lightweight connection pooler for PostgreSQL.
* [pgvector](pgvector/index.md): Open-source vector similarity search for PostgreSQL.
* [pgAudit](pgaudit/index.md): Provides detailed session and object audit logging for PostgreSQL.
* [PostGIS](postgis/index.md): Geospatial support for PostgreSQL.
* [PostgREST](postgrest/index.md): RESTful API server for PostgreSQL.
* [psycopg2](psycopg2/index.md): Python connector for PostgreSQL.

## pgEdge Agentic AI Toolkit for Postgres

* [pgEdge Docloader](pgedge-docloader/index.md): A command line tool for loading and maintaining documents in Postgres.
* [pgEdge Vectorizer](pgedge-vectorizer/index.md): A Postgres extension for chunking and vectorising documents in Postgres for semantic search with pgvector.

!!! warning "Early Development"
    The following products are previews intended for early development and experimentation only. They are not recommended for production use without comprehensive testing.

* [pgEdge Postgres MCP Server](pgedge-postgres-mcp-server/index.md): The MCP server allows you to use natural language queries when interacting with a Postgres database.
* [pgEdge Anonymizer](pgedge-anonymizer/index.md): A command line tool for replacing PII and other sensitive data in copies of production databases for dev/test.
* [pgEdge RAG Server](pgedge-rag-server/index.md): An API server for running RAG (Retrieval-Augmented Generation) queries based on documents stored in Postgres, supporting multiple pipelines and LLMs/models.

The AI-enabling extensions used by the pgEdge Agentic AI Toolkit are distributed via the [pgEdge Enterprise Postgres](enterprise/index.md) Repository, and are built into the standard [pgEdge Enterprise Postgres images](container-images/postgres-images.md) used by the [Control Plane](control-plane/index.md) and [pgEdge Helm](pgedge-helm/index.md).

## pgEdge Tools and Utilities

Useful tools and utilities from the development team at pgEdge:

* [pgedge-loadgen](pgedge-loadgen/index.md): A CLI tool for generating realistic PostgreSQL workloads. Creates schemas for fictional applications, populates them with test data, and runs load simulations with temporal usage patterns.
* [radar](radar/index.md): Agentless, zero-dependency diagnostic data collection tool for PostgreSQL and system metrics.
