---
hide:
  - toc
  - navigation
---

pgEdge Postgres is designed for high availability and global
distribution - a robust shared architecture allows you to install your
Postgres deployment across multiple data centers, in containers, or in bare
metal deployments with enterprise-quality tooling.

| pgEdge Feature | [pgEdge Enterprise Postgres](enterprise/index.md) | [pgEdge Cloud](cloud/cloud) | [Containers](pgedge-containers) | [pgEdge Distributed Postgres](platform/index.md) |
|---------|:---:|:---:|:---:|:---:|
| [ACE](ace/) *ensures and maintains data consistency across nodes.* | ✓ | - | ✓ | ✓ |
| [Control Plane](control-plane/) *provides a CLI for managing distributed clusters.* | ✓ | ✓ | ✓ | ✓ |
| [lolor Extension](lolor/) *provides logical-logical replication for data sync.* | ✓ | ~ | ✓ | ✓ |
| [pgEdge Anonymizer](pgedge-anonymizer/) *enables data masking for compliance.* | ✓ | ~ | ✓ | ✓ |
| [pgEdge Docloader](pgedge-docloader/) *loads unstructured data for AI applications.* | ✓ | ~ | ✓ | ✓ |
| [pgedge-loadgen](pgedge-loadgen/) *provides performance testing and benchmarking.* | ✓ | ~ | ✓ | ✓ |
| [pgEdge Postgres MCP Server](pgedge-postgres-mcp-server/) *implements AI agent protocol.* | ✓ | ~ | ✓ | ✓ |
| [pgEdge RAG Server](pgedge-rag-server/) *enables retrieval-augmented generation.* | ✓ | ~ | ✓ | ✓ |
| [pgEdge Vectorizer Extension](pgedge-vectorizer/) *generates automatic vector embeddings.* | ✓ | ~ | ✓ | ✓ |
| [radar](radar/) *provides cluster monitoring and observability.* | ✓ | - | ✓ | ✓ |
| [Snowflake Extension](snowflake/) *is a foreign data wrapper for querying Snowflake.* | ✓ | - | ✓ | ✓ |
| [Spock Extension](spock-v5/) *enables multi-master logical replication.* | ✓ | ✓ | ✓ | ✓ |

Legend:

    ✓ = included / first-class support
    ~ = integrates or optional
    — = not typically used with distribution

