# Managing Extensions on a pgEdge Distributed Postgres (VM Edition) Cluster 

You can use VM Edition's command-line interface (CLI) and the Update Manager [(um)](../pgedge_commands/um/index.md) module to help manage extensions on a pgEdge cluster. Command options let you install, remove, upgrade, and check the availability of extensions for your Postgres installation. 

To find a list of the available build versions and build dates for components that Update Manager can add to your cluster, navigate into the `pgedge` directory, and invoke the command:

`./pgedge um list`

```bash
Category     | Component       | Version   | ReleaseDt  | Stage | Status    | Updates | PreReqs
Postgres       pg15              15.13-1     2025-05-08   prod                                   
Postgres       pg16              16.9-1      2025-05-08   prod                                   
Postgres       pg17              17.5-1      2025-05-08   prod    Installed                      
Extensions     audit-pg17        17.0-1      2024-09-12   prod                                   
Extensions     cron-pg17         1.6.4-1     2024-09-10   prod                                   
Extensions     hintplan-pg17     1.7.0-1     2024-09-10   prod                                   
Extensions     lolor-pg17        1.2-1       2024-05-21   prod                                   
Extensions     orafce-pg17       4.13.4-1    2024-11-04   prod                                   
Extensions     pldebugger-pg17   1.8-1       2024-09-05   prod                                   
Extensions     plprofiler-pg17   4.2.5-1     2024-08-20   prod                                   
Extensions     plv8-pg17         3.2.3-1     2024-11-04   prod                                   
Extensions     postgis-pg17      3.5.0-3     2025-04-04   prod                                   
Extensions     setuser-pg17      4.1.0-1     2024-09-12   prod                                   
Extensions     snowflake-pg17    2.2-1       2024-06-26   prod    Installed                      
Extensions     spock40-pg17      4.0.10-1    2025-02-24   prod    Installed                      
Extensions     vector-pg17       0.8.0-1     2024-11-01   prod                                   
Applications   etcd              3.5.12-2    2024-03-28   prod                          EL       
Applications   patroni           3.2.2.2-1   2024-11-07   prod                          EL       
   
```

The Update Manager table displays the following information about the available extension versions:

* The `Category` column identifies the component as a Postgres version, an extension, or an application.
* The `Component` column lists the name of the component, followed by the Postgres version that the component runs on.
* The `Version` column displays the available version of the component.
* The `ReleaseDt` column displays the date that the listed version was released.
* The `Stage` column displays a note about the build; production releases are noted with the abbreviation prod.
* The `Status` column displays `Installed` if the listed component is installed on your system.
* The `Updates` column identifies components with available updates; you can use the [pgedge um update](https://docs.pgedge.com/platform/pgedge_commands/doc/um-update) command to update components.
* The `PreReqs` column identifies any prerequisites required by the component.

Then, to install an extension, use the [um install](https://docs.pgedge.com/platform/pgedge_commands/doc/um-install) command:

`./pgedge um install component_name`

Where `component_name` is the name of the component you wish to install.  For example, the following command installs PostGIS, updates the `shared_preload_libraries` parameter, restarts the server, and creates the extension:

```bash
./pgedge um install postgis

########### Installing postgis-pg17 ###############
  ['postgis-pg17']

Get:1 https://pgedge-download.s3.amazonaws.com/REPO postgis-pg17-3.5.0-3-arm
   24 MB [100%]

Unpacking postgis-pg17-3.5.0-3-arm.tgz
  new: shared_preload_libraries = 'pg_stat_statements, snowflake, spock, postgis-3'

pg17 stopping
pg17 starting on port 6432

$ pg17/bin/psql -p 6432 -c "CREATE EXTENSION IF NOT EXISTS postgis CASCADE" postgres
CREATE EXTENSION
```

!!! info

    For detailed information about configuring a component after installation, please refer to the component documentation.

### pgEdge Supporting Components

Please note that the components available for installation via the UM module will vary with each Postgres version. The following list is intended only to provide quick links to more information about each component.

* [Postgres](https://www.postgresql.org/) is a powerful, open source object-relational database system with over 35 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance.

* [CLI](https://docs.pgedge.com/platform/pgedge_commands) is the command line interface for pgEdge Distributed Postgres: VM Edition.

* The [Spock](https://docs.pgedge.com/spock_ext) extension provides multi-master (multi-active) replication for Postgres. We leveraged both the pgLogical & BDR2 Open Source projects as a solid foundation to build upon for this enterprise-class extension.

* The [ACE](https://docs.pgedge.com/ace) extension provides the Active Consistency Engine for a SPOCK cluster.

* The [Snowflake](https://docs.pgedge.com/snowflake) extension provides unique sequences designed for active-active replication.

* The [lolor](https://docs.pgedge.com/snowflake) extension provides large object support that works seamlessly with Spock active-active replication.

* [Citus](https://docs.citusdata.com/en/stable/get_started/what_is_citus.html) provides an open source extension that supports Postgres features including distributed tables.

* [etcd](https://etcd.io/) is a strongly consistent, distributed key-value store that provides a reliable way to store data that needs to be accessed by a distributed system or cluster of machines.

* [HAProxy](https://www.haproxy.org) is a free, very fast and reliable reverse-proxy offering high availability, load balancing, and proxying for TCP and HTTP-based applications. It is particularly suited for very high traffic web sites and powers a significant portion of the world's most visited ones.

* [Patroni](https://github.com/pgedge/patroni) is a template for high availability (HA) Postgres solutions using Python. 

* [pgBackRest](https://pgbackrest.org/) is a reliable, easy-to-use backup and restore solution that can seamlessly scale up to the largest databases and workloads by utilizing algorithms that are optimized for database-specific requirements.

* [pgCat2](https://github.com/pgEdge/pgcat) is a Postgres pooler and proxy (like PgBouncer) with support for sharding, load balancing, failover and mirroring.

* [pg_curl](https://github.com/RekGRpth/pg_curl) allows most curl actions, including data transfer with URL syntax via HTTP, HTTPS, FTP, FTPS, GOPHER, TFTP, SCP, SFTP, SMB, TELNET, DICT, LDAP, LDAPS, FILE, IMAP, SMTP, POP3, RTSP and RTMP.

* [PostgREST](https://www.pgedge.com/blog/pgedge-distributed-postgresql-and-postgrest) is a standalone web server that allows you to access your pgEdge Postgres database cluster with RESTful API calls. It is very simple to use because the API is built on the existing structure and inherits permissions you've already defined in your Postgres database. You use a simple configuration file to specify the schema objects that will be exposed through the API. While the server monitors the default listener port, for libpq-styled calls to the server, the PostgREST server monitors port 3000 for API-styled calls.

* [pgAdmin](https://www.pgadmin.org/) is an open-source graphical administration and development client for Postgres that works on Linux, Unix, macOS, and Windows.

* [HypoPG](https://hypopg.readthedocs.io/en/latest/) is a Postgres extension that adds support for Hypothetical Indexes. 

* [oracle_fdw](https://github.com/laurenz/oracle_fdw) is a Postgres extension that provides a Foreign Data Wrapper for easy and efficient access to Oracle databases, including pushdown of WHERE conditions and required columns as well as comprehensive EXPLAIN support.

* [orafce](https://github.com/orafce/orafce#orafce---oracles-compatibility-functions-and-packages) supports functions and operators that emulate a subset of functions and packages from the Oracle RDBMS.

* [pgAudit](https://github.com/pgaudit/pgaudit) provides detailed session and/or object audit logging via the standard Postgres logging facility.

* [pg_cat](https://github.com/postgresml/pgcat) is a Postgres pooler and proxy with support for sharding, load balancing, failover and mirroring.

* [pg_cron]() is a simple cron-based job scheduler for Postgres (10 or higher) that runs inside the database as an extension.

* [pg_hint_plan](https://github.com/ossc-db/pg_hint_plan) makes it possible to tweak Postgres execution plans using so-called "hints" in SQL comments, like /*+ SeqScan(a) */.

* [pg_partman](https://github.com/pgpartman/pg_partman#pg-partition-manager) is an extension to create and manage both time-based and serial-based table partition sets.

* [pg_repack](https://github.com/reorg/pg_repack) is a Postgres extension which lets you remove bloat from tables and indexes, and optionally restore the physical order of clustered indexes. 

* [pgvector](https://github.com/pgvector/pgvector) enables you to store vector embeddings and perform vector similarity search in Postgres. It is particularly useful for applications involving natural language processing, such as those built on top of OpenAI's GPT models.

* The [PL/Debugger](https://github.com/EnterpriseDB/pldebugger) module is a set of shared libraries which implement an API for debugging pl/pgsql functions on Postgres 8.4 and above.

* [plprofiler](https://github.com/bigsql/plprofiler#plprofiler) is an extension for Postgres that creates performance profiles of PL/pgSQL functions and stored procedures. 

* [PLV8](https://github.com/plv8/plv8) is a shared library that provides a Postgres procedural language powered by V8 Javascript Engine. With this program you can write functions in Javascript that are callable from SQL.

* [PostGIS](https://postgis.net/documentation/) extends the capabilities of the Postgres relational database by adding support for storing, indexing, and querying geographic data.

* [TimescaleDB](https://github.com/timescale/timescaledb) is an open-source database designed to make SQL scalable for time-series data. It is engineered from Postgres and packaged as an extension, providing automatic partitioning across time and space (partitioning key), as well as full SQL support.

