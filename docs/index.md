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
* [pgEdge Containers](pgedge-containers/index.md): Deploy single node or fully-distributed Postgres on Kubernetes.

## Component Documentation

* [ACE (Active Consistency Engine)](ace/index.md): Data integrity for replicating clusters.
* [Control Plane](control-plane/index.md): A distributed application that provides a declarative API to deploy and manage Postgres databases.
* [lolor](lolor/index.md): A large object replication extension for Postgres.
* [Snowflake](snowflake/index.md): Cluster-wide unique (Snowflake) sequence extension for Postgres.
* [Spock v5](spock-v5/index.md): Multi-master replication for Postgres.

## pgEdge Agentic AI Toolkit for Postgres

!!! warning "Early Development"
    The products listed below are previews intended for early development and experimentation only. They are not recommended for production use.

* [pgEdge Postgres MCP Server](pgedge-postgres-mcp/index.md): The MCP server allows you to use natural language queries when interacting with a Postgres database.
* [pgEdge Anonymizer](pgedge-anonymizer/index.md): A command line tool for replacing PII and other sensitive data in copies of production databases for dev/test.
* [pgEdge Docloader](pgedge-docloader/index.md): A command line tool for loading and maintaining documents in Postgres.
* [pgEdge RAG Server](pgedge-rag-server/index.md): An API server for running RAG (Retrieval-Augmented Generation) queries based on documents stored in Postgres, supporting multiple pipelines and LLMs/models.
* [pgEdge Vectorizer](pgedge-vectorizer/index.md): A Postgres extension for chunking and vectorising documents in Postgres for semantic search with pgvector.

The AI-enabling extensions used by the pgEdge Agentic AI Toolkit are distributed via the [pgEdge Enterprise Postgres](enterprise/index.md) Repository, and are built into the standard images used by both the Control Plane (control-plane/index.md) and the pgEdge Containers HELM chart (pgedge-containers/index.md).