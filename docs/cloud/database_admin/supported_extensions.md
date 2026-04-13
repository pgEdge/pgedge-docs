# Supported Extensions

pgEdge Cloud databases include pre-installed PostgreSQL extensions.
Before using an extension, you must
[create the extension](https://www.postgresql.org/docs/current/extend-extensions.html)
in each database where the extension will be used. To create an
extension, invoke the following command on the
[psql command line](../connecting/psql.md):

```sql
CREATE EXTENSION extension_name;
```

For example, to create the pgvector extension, use the following command:

```sql
CREATE EXTENSION vector;
```

To review a list of installed extensions, use the psql command line
client to display the `shared_preload_libraries` parameter with the
`SHOW` command:

```sql
accts=# SHOW shared_preload_libraries;
shared_preload_libraries
-------------------------------------------------------------------------------
pg_stat_statements, pg_readonly, pg_failover_slots, spock, vector, postgis-3
(1 row)
```

For detailed information about using each extension, visit the project
site links provided in the table.


## pgEdge and Community Extensions

The following table describes the pgEdge and community extensions
available in pgEdge Cloud. Extension names match the name used in
`CREATE EXTENSION` statements:

| Extension | Version | Description |
|-----------|---------|-------------|
| [lolor](https://github.com/pgEdge/lolor) | 1.2.2 | Large object logical replication support |
| [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) | 1.12 | Planning and execution statistics for SQL statements |
| [pg_tokenizer](https://github.com/tensorchord/pg_tokenizer.rs) | 0.1.1 | Text tokenization for search and AI workloads |
| [pgmq](https://github.com/pgmq/pgmq) | 1.8.0 | Lightweight message queue built on PostgreSQL |
| [postgis](https://postgis.net/) | 3.5.5 | Geospatial data types, functions, and indexing |
| [snowflake](https://github.com/pgEdge/snowflake) | 2.4 | Distributed unique ID generation |
| [spock](https://github.com/pgEdge/spock) | 5.0.6 | Multi-master logical replication |
| [system_stats](https://github.com/EnterpriseDB/system_stats) | 3.0 | System-level performance statistics |
| [vchord_bm25](https://github.com/tensorchord/VectorChord-bm25) | 0.2.2 | BM25 ranking for full-text vector search |
| [vector](https://github.com/pgvector/pgvector) | 0.8.1 | Vector similarity search for AI embeddings |

!!! note

    PostGIS includes additional extensions available via
    `CREATE EXTENSION`: address_standardizer,
    address_standardizer_data_us, postgis_raster,
    postgis_sfcgal, postgis_tiger_geocoder, and
    postgis_topology.

## PostgreSQL Contrib Modules

pgEdge Cloud databases also include the standard PostgreSQL contrib
modules. The following table describes the available contrib
extensions:

| Extension | Version | Description |
|-----------|---------|-------------|
| [amcheck](https://www.postgresql.org/docs/current/amcheck.html) | 1.5 | Verify relation integrity |
| [autoinc](https://www.postgresql.org/docs/current/contrib-spi.html#CONTRIB-SPI-AUTOINC) | 1.0 | Autoincrementing fields |
| [bloom](https://www.postgresql.org/docs/current/bloom.html) | 1.0 | Bloom filter index access method |
| [btree_gin](https://www.postgresql.org/docs/current/btree-gin.html) | 1.3 | GIN index support for common data types |
| [btree_gist](https://www.postgresql.org/docs/current/btree-gist.html) | 1.8 | GiST index support for common data types |
| [citext](https://www.postgresql.org/docs/current/citext.html) | 1.8 | Case-insensitive character string data type |
| [cube](https://www.postgresql.org/docs/current/cube.html) | 1.5 | Multidimensional cube data type |
| [dblink](https://www.postgresql.org/docs/current/dblink.html) | 1.2 | Connect to other PostgreSQL databases |
| [dict_int](https://www.postgresql.org/docs/current/dict-int.html) | 1.0 | Text search dictionary for integers |
| [dict_xsyn](https://www.postgresql.org/docs/current/dict-xsyn.html) | 1.0 | Text search dictionary for extended synonyms |
| [earthdistance](https://www.postgresql.org/docs/current/earthdistance.html) | 1.2 | Great-circle distance calculations |
| [file_fdw](https://www.postgresql.org/docs/current/file-fdw.html) | 1.0 | Foreign data wrapper for flat files |
| [fuzzystrmatch](https://www.postgresql.org/docs/current/fuzzystrmatch.html) | 1.2 | String similarity and distance functions |
| [hstore](https://www.postgresql.org/docs/current/hstore.html) | 1.8 | Key-value pair data type |
| [hstore_plperl](https://www.postgresql.org/docs/current/hstore.html#HSTORE-TRANSFORMS) | 1.0 | Transform between hstore and PL/Perl |
| [hstore_plperlu](https://www.postgresql.org/docs/current/hstore.html#HSTORE-TRANSFORMS) | 1.0 | Transform between hstore and PL/PerlU |
| [insert_username](https://www.postgresql.org/docs/current/contrib-spi.html#CONTRIB-SPI-INSERT-USERNAME) | 1.0 | Track who changed a table |
| [intagg](https://www.postgresql.org/docs/current/intagg.html) | 1.1 | Integer aggregator and enumerator |
| [intarray](https://www.postgresql.org/docs/current/intarray.html) | 1.5 | Functions and operators for integer arrays |
| [isn](https://www.postgresql.org/docs/current/isn.html) | 1.3 | International product numbering data types |
| [jsonb_plperl](https://www.postgresql.org/docs/current/datatype-json.html#DATATYPE-JSON-TRANSFORMS) | 1.0 | Transform between jsonb and PL/Perl |
| [jsonb_plperlu](https://www.postgresql.org/docs/current/datatype-json.html#DATATYPE-JSON-TRANSFORMS) | 1.0 | Transform between jsonb and PL/PerlU |
| [lo](https://www.postgresql.org/docs/current/lo.html) | 1.2 | Large object maintenance |
| [ltree](https://www.postgresql.org/docs/current/ltree.html) | 1.3 | Hierarchical tree-like data type |
| [moddatetime](https://www.postgresql.org/docs/current/contrib-spi.html#CONTRIB-SPI-MODDATETIME) | 1.0 | Track last modification time |
| [pageinspect](https://www.postgresql.org/docs/current/pageinspect.html) | 1.13 | Inspect database pages at a low level |
| [pg_buffercache](https://www.postgresql.org/docs/current/pgbuffercache.html) | 1.6 | Examine the shared buffer cache |
| [pg_freespacemap](https://www.postgresql.org/docs/current/pgfreespacemap.html) | 1.3 | Examine the free space map |
| [pg_logicalinspect](https://www.postgresql.org/docs/current/pglogicalinspect.html) | 1.0 | Inspect logical decoding components |
| [pg_prewarm](https://www.postgresql.org/docs/current/pgprewarm.html) | 1.2 | Prewarm relation data |
| [pg_surgery](https://www.postgresql.org/docs/current/pgsurgery.html) | 1.0 | Perform surgery on damaged relations |
| [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) | 1.6 | Trigram-based text similarity and search |
| [pg_visibility](https://www.postgresql.org/docs/current/pgvisibility.html) | 1.2 | Examine visibility map and page info |
| [pg_walinspect](https://www.postgresql.org/docs/current/pgwalinspect.html) | 1.1 | Inspect write-ahead log contents |
| [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html) | 1.4 | Cryptographic functions |
| [pgrowlocks](https://www.postgresql.org/docs/current/pgrowlocks.html) | 1.2 | Row-level locking information |
| [pgstattuple](https://www.postgresql.org/docs/current/pgstattuple.html) | 1.5 | Tuple-level statistics |
| [plpgsql](https://www.postgresql.org/docs/current/plpgsql.html) | 1.0 | PL/pgSQL procedural language |
| [postgres_fdw](https://www.postgresql.org/docs/current/postgres-fdw.html) | 1.2 | Foreign data wrapper for remote PostgreSQL |
| [refint](https://www.postgresql.org/docs/current/contrib-spi.html#CONTRIB-SPI-REFINT) | 1.0 | Referential integrity functions |
| [seg](https://www.postgresql.org/docs/current/seg.html) | 1.4 | Line segment and floating-point interval data type |
| [sslinfo](https://www.postgresql.org/docs/current/sslinfo.html) | 1.2 | SSL certificate information |
| [tablefunc](https://www.postgresql.org/docs/current/tablefunc.html) | 1.0 | Table-manipulating functions including crosstab |
| [tcn](https://www.postgresql.org/docs/current/tcn.html) | 1.0 | Triggered change notifications |
| [tsm_system_rows](https://www.postgresql.org/docs/current/tsm-system-rows.html) | 1.0 | TABLESAMPLE by number of rows |
| [tsm_system_time](https://www.postgresql.org/docs/current/tsm-system-time.html) | 1.0 | TABLESAMPLE by time in milliseconds |
| [unaccent](https://www.postgresql.org/docs/current/unaccent.html) | 1.1 | Text search dictionary that removes accents |
| [uuid-ossp](https://www.postgresql.org/docs/current/uuid-ossp.html) | 1.1 | Generate universally unique identifiers |
| [xml2](https://www.postgresql.org/docs/current/xml2.html) | 1.2 | XPath querying and XSLT |

## Coming Soon

The following extensions are included in the pgEdge Cloud container image
but require `shared_preload_libraries` configuration changes that are not
yet available through the pgEdge Cloud interface. These extensions will be
supported in a future update.

| Extension | Version | Description |
|-----------|---------|-------------|
| [pg_cron](https://github.com/citusdata/pg_cron) | 1.6 | Job scheduler for running periodic SQL tasks |
| [pg_stat_monitor](https://github.com/percona/pg_stat_monitor) | 2.3 | Query performance monitoring and statistics |
| [pg_vectorize](https://github.com/tembo-io/pg_vectorize) | 0.23.0 | SQL-level vector search utilities |
| [pgaudit](https://github.com/pgaudit/pgaudit) | 18.0 | Detailed session and object audit logging |
| [pgedge_vectorizer](https://github.com/pgEdge/pgedge-vectorizer) | 1.0 | Automated text chunking and embedding generation |
