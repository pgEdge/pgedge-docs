# Extending PostgreSQL Functionality

Cloud automatically installs the following Postgres extensions in your Postgres database:

| Extension  | Description  
|------------|--------------
|[pgvector](https://github.com/pgvector/pgvector)| Provides vector similarity search capabilities. 
|[PostGIS](https://postgis.net/documentation/getting_started/)| Provides support for storing, indexing, and querying geospatial and geometric data.

Before using an extension, you must [create the extension](https://www.postgresql.org/docs/16/extend-extensions.html) in each database in which it will be used. Invoke the following command on the [psql command line](/cloud/connecting/psql.md):

`CREATE EXTENSION extension_name;`

For example, to create the pgvector extension, use the command:

`CREATE EXTENSION vector;`

For detailed information about using each extension, visit the project's site links provided in the table above. 

To review a list of the installed extensions, you can use the psql command line client to display the `shared_preload_libraries` parameter setting. To review a list of installed extensions, use the `SHOW shared_preload_libraries;` command:

```sql
accts=# SHOW shared_preload_libraries;
shared_preload_libraries
-------------------------------------------------------------------------------
pg_stat_statements, pg_readonly, pg_failover_slots, spock, vector, postgis-3
(1 row)
```

Installed extensions are listed in the query result set. 
