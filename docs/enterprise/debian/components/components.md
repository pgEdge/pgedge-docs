# Configuring Supporting Components

Many of the supporting components distributed via the `pgedge` repository
follow standard configuration and usage as documented by their open-source
projects.

To review a list of packages available from the `pgedge` repository, use the
command:

  ```bash
  apt list | grep pgedge-*
  ```

Package names and links to the component documentation are noted in the table
below. `XX` in the package name indicates the package version; substitute your
preferred version into the package name (i.e. pgedge-postgresql-18-snowflake)
when installing the package to ensure you've installed the version that
matches your copy of Postgres.

| Component | Package | Description |
|-----------|---------|-------------|
| [Spock](https://docs.pgedge.com/spock-v5) | pgedge-spock50_XX | Multi-master logical replication |
| [Snowflake](https://docs.pgedge.com/snowflake) | pgedge-snowflake_XX | Distributed unique ID generator |
| [pgEdge Postgres MCP Server](https://docs.pgedge.com/pgedge-postgres-mcp-server) | pgedge-postgres-mcp | Model Context Protocol server and Natural Language Agent |
| [Postgres MCP KB Server](https://docs.pgedge.com/pgedge-postgres-mcp-server/development/advanced/knowledgebase/) | pgedge-postgres-mcp-kb | MCP support for Knowledgebase |
| [NLA CLI Client](https://docs.pgedge.com/pgedge-postgres-mcp-server/development/guide/cli-client/) | pgedge-nla-cli | Natural Language API CLI tool |
| [NLA Web Client](https://docs.pgedge.com/pgedge-postgres-mcp-server/development/guide/web-client/) | pgedge-nla-web | Natural Language API web interface |
| [pgEdge Anonymizer](https://docs.pgedge.com/pgedge-anonymizer/) | pgedge-anonymizer | Data anonymization and masking |
| [pgEdge DocLoader](https://docs.pgedge.com/pgedge-docloader/) | pgedge-docloader | Document loading utility |
| [pgEdge RAG Server](https://docs.pgedge.com/pgedge-rag-server/) | pgedge-rag-server | Retrieval-Augmented Generation server |
| [pgEdge Vectorizer](https://docs.pgedge.com/pgedge-vectorizer/) | pgedge-vectorizer_XX | Vector embedding generation |
| [ACE](ace.md) | pgedge-ace | Active Consistency Engine for cluster data validation |
| [Lolor](https://docs.pgedge.com/lolor/blob/main/README.md) | pgedge-lolor_XX | Logical-logical replication |
| [pgAdmin](https://www.pgadmin.org/docs/) | pgedge-pgadmin4; pgedge-pgadmin4-desktop; pgedge-pgadmin4-server; pgedge-pgadmin4-web | Web-based database management tool |
| [pgaudit](https://github.com/pgaudit/pgaudit/blob/main/README.md) | pgedge-pgaudit_XX | Session and object audit logging |
| [pgBackRest](https://docs.pgedge.com/platform/managing/pgbackrest) | pgedge-pgbackrest | Backup and restore solution |
| [PostGIS](https://postgis.net/documentation/) | pgedge-postgis35_XX | Spatial and geographic objects |
| [pgBouncer](#using-pgbouncer-with-pgedge-enterprise-postgres) | pgedge-pgbouncer | Lightweight connection pooler |
| [pgvector](https://github.com/pgvector/pgvector) | pgedge-pgvector_XX | Vector similarity search for Postgres |


!!! note

    After using the `pgedge` repository to install an extension, use the
    [CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html)
    command to create that extension in your database.

