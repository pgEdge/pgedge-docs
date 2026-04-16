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

| Component | Package | Description | Info |
|-----------|---------|-------------|------|
| Spock | pgedge-spock50_XX | Multi-master logical replication | [Info][spock] |
| Snowflake | pgedge-snowflake_XX | Distributed unique ID generator | [Info][snow] |
| pgEdge Postgres MCP Server | pgedge-postgres-mcp | Model Context Protocol server<br>and Natural Language Agent | [Info][mcp] |
| Postgres MCP KB Server | pgedge-postgres-mcp-kb | MCP support for Knowledgebase | [Info][kb] |
| NLA CLI Client | pgedge-nla-cli | Natural Language API CLI tool | [Info][cli] |
| NLA Web Client | pgedge-nla-web | Natural Language API web interface | [Info][web] |
| pgEdge Anonymizer | pgedge-anonymizer | Data anonymization and masking | [Info][anon] |
| pgEdge DocLoader | pgedge-docloader | Document loading utility | [Info][docl] |
| pgEdge RAG Server | pgedge-rag-server | Retrieval-Augmented Generation server | [Info][rag] |
| pgEdge Vectorizer | pgedge-vectorizer_XX | Vector embedding generation | [Info][vec] |
| Lolor | pgedge-lolor_XX | Logical-logical replication | [Info][lolor] |
| pgAdmin | pgedge-pgadmin4;<br>pgedge-pgadmin4-desktop;<br>pgedge-pgadmin4-server;<br>pgedge-pgadmin4-web | Web-based database management tool | [Info][pgadmin] |
| pgaudit | pgedge-pgaudit_XX | Session and object audit logging | [Info][pgaudit] |
| pgBackRest | pgedge-pgbackrest | Backup and restore solution | [Info][pgbr] |
| PostGIS | pgedge-postgis35_XX | Spatial and geographic objects | [Info][postgis] |
| pgBouncer | pgedge-pgbouncer | Lightweight connection pooler | [Info][pgb] |
| pgvector | pgedge-pgvector_XX | Vector similarity search for Postgres | [Info][pgvector] |

[spock]: https://docs.pgedge.com/spock-v5
[snow]: https://docs.pgedge.com/snowflake
[mcp]: https://docs.pgedge.com/pgedge-postgres-mcp-server
[kb]: https://docs.pgedge.com/pgedge-postgres-mcp-server/development/advanced/knowledgebase/
[cli]: https://docs.pgedge.com/pgedge-postgres-mcp-server/development/guide/cli-client/
[web]: https://docs.pgedge.com/pgedge-postgres-mcp-server/development/guide/web-client/
[anon]: https://docs.pgedge.com/pgedge-anonymizer/
[docl]: https://docs.pgedge.com/pgedge-docloader/
[rag]: https://docs.pgedge.com/pgedge-rag-server/
[vec]: https://docs.pgedge.com/pgedge-vectorizer/
[lolor]: https://docs.pgedge.com/lolor/blob/main/README.md
[pgadmin]: https://www.pgadmin.org/docs/
[pgaudit]: https://github.com/pgaudit/pgaudit/blob/main/README.md
[pgbr]: https://docs.pgedge.com/platform/managing/pgbackrest
[postgis]: https://postgis.net/documentation/
[pgb]: #using-pgbouncer-with-pgedge-enterprise-postgres
[pgvector]: https://github.com/pgvector/pgvector


!!! note

    After using the `pgedge` repository to install an extension, use the
    [CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html)
    command to create that extension in your database.

## Using pgBouncer with pgEdge Enterprise Postgres

PgBouncer is a lightweight connection pooler designed to work with Postgres.
After configuring the `pgedge` repo, you can install PgBouncer with the
command:

`sudo apt-get update`

`sudo apt-get install -y pgedge-pgbouncer`

After installing pgBouncer, copy the sample `userlist.txt` to the PgBouncer
configuration directory:

`sudo cp /usr/share/doc/pgbouncer/userlist.txt /etc/pgbouncer/`

Next, edit `/etc/pgbouncer/userlist.txt` and add your database user
credentials. Entries in the file take the form:

`"postgres" "your_password_here"`

Next, make sure the file has the correct permissions; use the command:

`sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt sudo chmod 600 /etc/pgbouncer/userlist.txt`

Before using pgBouncer, you'll need to share system configuration details in
the `/etc/pgbouncer/pgbouncer.ini` file; modify the file to match your
system. Provide database connection info, listener port, and other options as
needed.

Next, ensure that your Postgres server is up and running on the target port
and start and enable the PgBouncer service with the command:

`sudo systemctl start pgbouncer && sudo systemctl enable pgbouncer`

You can use the following command to check the status of the pgBouncer
service:

`sudo systemctl status pgbouncer`

To connect to your Postgres database through PgBouncer connection pooling,
use the command:

`psql -p 6432 -U your_username -d pgbouncer`

Note that `your_username` is a database user included in the
`/etc/pgbouncer/userlist.txt` file.