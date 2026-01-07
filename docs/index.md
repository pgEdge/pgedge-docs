---
hide:
  - toc
  - navigation
---

pgEdge Postgres is designed for high availability and global
distribution - a robust shared architecture allows you to install your
Postgres deployment across multiple data centers, in containers, or in bare
metal deployments with enterprise-quality tooling.

| pgEdge Feature | [<span style="color: blue; font-size: 1.2em;">pgEdge Enterprise Postgres</span>](enterprise/index.md) | [<span style="color: blue; font-size: 1.2em;">pgEdge Cloud</span>](cloud/cloud) | [<span style="color: blue; font-size: 1.2em;">Containers</span>](pgedge-containers) | [<span style="color: blue; font-size: 1.2em;">pgEdge Distributed Postgres</span>](platform/index.md) |
|---------|:---:|:---:|:---:|:---:|
| [<span style="color: blue; font-size: 1.2em;">ACE</span>](ace/) ensures and maintains data consistency across nodes. | ✓ | - | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">Control Plane</span>](control-plane/) provides a CLI for managing distributed clusters. | ✓ | ✓ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">lolor Extension</span>](lolor/) provides logical-logical replication for data sync. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgEdge Anonymizer</span>](pgedge-anonymizer/) enables data masking for compliance. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgEdge Docloader</span>](pgedge-docloader/) loads unstructured data for AI applications. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgedge-loadgen</span>](pgedge-loadgen/) provides performance testing and benchmarking. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgEdge Postgres MCP Server</span>](pgedge-postgres-mcp-server/) implements AI agent protocol. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgEdge RAG Server</span>](pgedge-rag-server/) enables retrieval-augmented generation. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">pgEdge Vectorizer Extension</span>](pgedge-vectorizer/) generates automatic vector embeddings. | ✓ | ~ | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">radar</span>](radar/) provides cluster monitoring and observability. | ✓ | - | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">Snowflake Extension</span>](snowflake/) is a foreign data wrapper for querying Snowflake. | ✓ | - | ✓ | ✓ |
| [<span style="color: blue; font-size: 1.2em;">Spock Extension</span>](spock-v5/) enables multi-master logical replication. | ✓ | ✓ | ✓ | ✓ |

Legend:

    ✓ = included / supported
    ~ = integrates or optional
    — = not typically used with distribution

