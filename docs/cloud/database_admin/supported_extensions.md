# Supported Extensions

pgEdge Cloud databases include pre-installed PostgreSQL extensions
ready to activate. For instructions on enabling extensions, see
[Using Postgres Extensions](extensions.md).

## pgEdge and Community Extensions

The following table shows the pgEdge and community extensions
available in pgEdge Cloud; extension names match the name used
in `CREATE EXTENSION` statements:

| Extension | Version | Description |
|-----------|---------|-------------|
| lolor | 1.2.2 | Large object logical replication support |
| pg_stat_statements | 1.12 | Planning and execution statistics for SQL statements |
| pg_tokenizer | 0.1.1 | Text tokenization for search and AI workloads |
| pgmq | 1.8.0 | Lightweight message queue built on PostgreSQL |
| postgis | 3.5.5 | Geospatial data types, functions, and indexing |
| snowflake | 2.4 | Distributed unique ID generation |
| spock | 5.0.6 | Multi-master logical replication |
| system_stats | 3.0 | System-level performance statistics |
| vchord_bm25 | 0.2.2 | BM25 ranking for full-text vector search |
| vector | 0.8.1 | Vector similarity search for AI embeddings |

!!! note

    PostGIS includes additional sub-extensions available via
    `CREATE EXTENSION`: postgis_raster, postgis_sfcgal,
    postgis_tiger_geocoder, and postgis_topology.

## PostgreSQL Contrib Modules

pgEdge Cloud databases also include the standard PostgreSQL
contrib modules. The following table shows the available
contrib extensions:

| Extension | Version | Description |
|-----------|---------|-------------|
| address_standardizer | 3.5.5 | Parse addresses into constituent elements |
| address_standardizer_data_us | 3.5.5 | Address standardizer US dataset |
| amcheck | 1.5 | Verify relation integrity |
| autoinc | 1.0 | Autoincrementing fields |
| bloom | 1.0 | Bloom filter index access method |
| btree_gin | 1.3 | GIN index support for common data types |
| btree_gist | 1.8 | GiST index support for common data types |
| citext | 1.8 | Case-insensitive character string data type |
| cube | 1.5 | Multidimensional cube data type |
| dblink | 1.2 | Connect to other PostgreSQL databases |
| dict_int | 1.0 | Text search dictionary for integers |
| dict_xsyn | 1.0 | Text search dictionary for extended synonyms |
| earthdistance | 1.2 | Great-circle distance calculations |
| file_fdw | 1.0 | Foreign data wrapper for flat files |
| fuzzystrmatch | 1.2 | String similarity and distance functions |
| hstore | 1.8 | Key-value pair data type |
| hstore_plperl | 1.0 | Transform between hstore and PL/Perl |
| hstore_plperlu | 1.0 | Transform between hstore and PL/PerlU |
| insert_username | 1.0 | Track who changed a table |
| intagg | 1.1 | Integer aggregator and enumerator |
| intarray | 1.5 | Functions and operators for integer arrays |
| isn | 1.3 | International product numbering data types |
| jsonb_plperl | 1.0 | Transform between jsonb and PL/Perl |
| jsonb_plperlu | 1.0 | Transform between jsonb and PL/PerlU |
| lo | 1.2 | Large object maintenance |
| ltree | 1.3 | Hierarchical tree-like data type |
| moddatetime | 1.0 | Track last modification time |
| pageinspect | 1.13 | Inspect database pages at a low level |
| pg_buffercache | 1.6 | Examine the shared buffer cache |
| pg_freespacemap | 1.3 | Examine the free space map |
| pg_logicalinspect | 1.0 | Inspect logical decoding components |
| pg_prewarm | 1.2 | Prewarm relation data |
| pg_surgery | 1.0 | Perform surgery on damaged relations |
| pg_trgm | 1.6 | Trigram-based text similarity and search |
| pg_visibility | 1.2 | Examine visibility map and page info |
| pg_walinspect | 1.1 | Inspect write-ahead log contents |
| pgcrypto | 1.4 | Cryptographic functions |
| pgrowlocks | 1.2 | Row-level locking information |
| pgstattuple | 1.5 | Tuple-level statistics |
| plpgsql | 1.0 | PL/pgSQL procedural language |
| postgres_fdw | 1.2 | Foreign data wrapper for remote PostgreSQL |
| refint | 1.0 | Referential integrity functions |
| seg | 1.4 | Line segment and floating-point interval data type |
| sslinfo | 1.2 | SSL certificate information |
| tablefunc | 1.0 | Table-manipulating functions including crosstab |
| tcn | 1.0 | Triggered change notifications |
| tsm_system_rows | 1.0 | TABLESAMPLE by number of rows |
| tsm_system_time | 1.0 | TABLESAMPLE by time in milliseconds |
| unaccent | 1.1 | Text search dictionary that removes accents |
| uuid-ossp | 1.1 | Generate universally unique identifiers |
| xml2 | 1.2 | XPath querying and XSLT |

## Coming Soon

The following extensions are included in the Cloud container image
but require server configuration changes
(`shared_preload_libraries`) that are not yet available through the
Cloud interface. These will be supported in a future update.

| Extension | Version | Description |
|-----------|---------|-------------|
| pg_cron | 1.6 | Job scheduler for running periodic SQL tasks |
| pg_stat_monitor | 2.3 | Query performance monitoring and statistics |
| pg_vectorize | 0.23.0 | SQL-level vector search utilities |
| pgaudit | 18.0 | Detailed session and object audit logging |
| pgedge_vectorizer | 1.0 | Automated text chunking and embedding generation |
