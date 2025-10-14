# Configuring Automatic DDL Replication

A DDL command is a statement that adds, alters, or drops a database object, such as `CREATE TABLE`, `ALTER TRIGGER`, or `DROP MATERIALIZED VIEW`. Some commands that make DDL changes are implemented in Postgres as clauses of other SQL commands; an example of this is a clause that modifies a column within a table.

The schema on each node in the cluster must match exactly when you enable auto-DDL. The best time to enable auto-DDL is after installing the CLI (with a pgEdge Distributed Postgres database), but before you create tables. 

If you already have a cluster with tables, you should ensure that your tables are [added to the default replication set](../pgedge_commands/doc/spock-repset-add-table.md) before enabling and configuring automatic DDL replication. Spock will ensure your tables remain in the correct `default` or `default insert only` replication sets any time those tables are altered.

You can use the following command to add tables with a primary key to the `default` replication set:

`spock repset-add-table default table_name db_name`

If you have tables that do not have a primary key, you should add those tables to the `default_insert_only` replication set with the command:

`spock repset-add-table default_insert_only table_name db_name`

Then, to implement auto-DDL replication, connect to each node in the cluster with the psql client, and invoke the following commands:

```sh
ALTER SYSTEM SET spock.enable_ddl_replication=on;
ALTER SYSTEM SET spock.include_ddl_repset=on;
ALTER SYSTEM SET spock.allow_ddl_from_functions=on;
SELECT pg_reload_conf();
```

**Note:** The third `SET` statement is optional; it enables automatic DDL replication from within functions and anonymous code blocks (`DO$$ ... $$`).

## How Automatic DDL Replication Impacts Table Management

If automatic DDL replication is enabled:

* Any tables created with a primary key are added to the `default` replication set. 

* Any tables created without a primary key are added to the `default_insert_only` replication set; if you add a primary key for a table, the table is moved into the `default` replication set.

* If you remove a primary key from a table, the table is moved from the `default` replication set to the `default_insert_only` replication set. 

* Setting a table as `unlogged` will remove it from replication. Similarly, setting a table back to `logged` will add it to the replication set.

* Detaching a partition does not remove that table from the replication set. 

## Limitations

**WARNING:**
Some DDL statements (for example `DROP TABLE`, or `CREATE TABLE AS`) can break replication in an operational cluster. If you plan to keep auto-DDL enabled on a replicating cluster, we recommend using a maintenance window to make any changes to your DDL.

| DDL Statement | Explanation |
|---------------|------------------|
| `CREATE TABLE AS` | The DDL statement will replicate, but not the data that is inserted into the table. This means that on n1 if you do a `CREATE TABLE t1 AS SELECT * FROM t;` the table will be created on n1 with all the rows that are n1 at that time, and the DDL statement will be replicated to n2, where the select would happen again to populate the table. If at that moment the records are different on n1 and n2 in table t, then the records will be different in the new table t1. | 
| Workaround: | Instead of using `CREATE TABLE AS`, you should perform a `CREATE TABLE t1…;` and then an `INSERT INTO t1 SELECT * FROM t2;` |
| Maintenance Commands | Maintenance commands such as `VACUUM`, `ANALYZE`, `CLUSTER`, `CHECKPOINT`, and `REINDEX` can be problematic if run on more than one cluster node at a time. |
| Workaround: | To safely perform maintenance, you should schedule maintenance functions for each node during a different maintenance window. |

The following commands don't replicate or have the potential to be problematic, and should be performed on each node individually:

 * `CREATE DATABASE`
 * `ALTER DATABASE`
 * `DROP DATABASE`
 * `ALTER SYSTEM`
 * `ALTER TABLE ... DETACH CONCURRENTLY`
 * `CREATE INDEX... CONCURRENTLY`
  





