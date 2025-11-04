# Managing Exceptions during Replication

Spock includes functionality that allows you to write some exceptions to the *exception log table*. This functionality can prevent interruptions in replication, and allow you to gracefully handle replication errors at a time that best suits your schedule and the server traffic. The exception table also provides visibility into the history of replication errors, and provides information to later remediate the errors with tools like ACE.

pgEdge Distributed Postgres (VM Edition) clusters running the Spock extension can use a mechanism that allows you to make changes on one node, while not replicating those changes to other nodes (a *repair mode*). You can use repair mode when fixing data anomalies on a single node, to ensure the modifications don’t propagate to other nodes in the cluster. 

**Protective Pause Mode** If you do not configure your cluster to log errors to the exception log table and the cluster encounters an error in replication, the Spock extension will enter a *protective pause* mode. During a protective pause, replication stops and the extension continues to retry the failing operation until the issue is resolved. No other transactions are replicated to standby nodes while the conflict remains.

One example of a replication error that can induce a protective pause occurs if you attempt to `UPDATE` a row that exists only on one node with a unique primary key. The Spock extension will attempt to update the row on other nodes until it is successful, not replicating any operations that come after the update until the conflict is resolved. When the `UPDATE` is successful, and the protective pause is lifted, the Spock extension will be self-healing (whether the conflict is resolved automatically or manually with repair mode), and replication will continue.

## Enabling Exception Logging

You can customize exception logging behavior related to a failed `INSERT`, `UPDATE`, or `DELETE` statement for your cluster by setting the GUC values that follow. These GUCs allow you to specify behaviors on a granular level, applying the actions you choose for operations within a transaction, rather than to an entire transaction. Note that changes to these GUCs require a system restart to apply.

To set the values and reload the server, use the CLI's [`db guc-set` command](../pgedge_commands/db.md):

`./pgedge db guc-set guc_name guc_value`

For example, to set `spock.exception_behaviour` to `discard`, navigate into the `pgedge` directory and invoke the command:

`./pgedge db guc-set spock.exception_behaviour discard`

 The default values for this GUC is `transdiscard`; by default, if an error occurs, all operations within a transaction are rolled back if one operation returns an ERROR. If spock.exception_logging is set to `all` (the default), the server will record the transaction in the exception log.

Exception logging behavior is controlled by the following GUCs:

### **spock.exception_logging**  

Use this GUC to specify which operations/transactions are written to the exception log table: 

* `all` (the default) - Set `spock.exception_logging` to `all` to instruct the server to record all transactions that contain one or more failed operations in the `spock.exception_log` table. Note that this setting will log all operations that are part of a transaction if one operation fails.
* `discard` - Add a row to the `spock.exception_log` table for any discarded operation; successful transactions are not logged.
* `none` - Instructs the server to not log any operation or transactions to the exception log table.

### **spock.exception_behaviour** 

Use this GUC to specify the commit behavior when Spock encounters an ERROR within a transaction:

* `transdiscard` (the default) - Set `spock.exception_behaviour` to `transdiscard` to instruct the server to discard a transaction if any operation within that transaction returns an `ERROR`.
* `discard` - Set `spock.exception_behaviour` to `discard` to continue processing (and replicating) without interrupting server use. The server will commit any operation (any portion of a transaction) that does not return an `ERROR` statement.
* `sub_disable` - Set `spock.exception_behaviour` to `sub_disable` to disable the subscription for the node on which the exception was reported. Transactions for the disabled node will be added to a queue that is written to the WAL log file; when the subscription is enabled, replication will resume with the transaction that caused the exception, followed by the other queued transactions. You can use the `spock.alter_sub_skip_lsn` function to skip the transaction that caused the exception and resume processing with the next transaction in the queue.

Note that the value you choose for `spock.exception_behaviour` could potentially result in a large WAL log if transactions are allowed to accumulate.

## The Table Structure

You can use information stored in the exception log table to identify operations or transactions that need to be repaired or rolled back. The exception log table contains the following information:

| Column | Type |
|--------|------|
| remote_origin | oid NOT NULL |
| remote_commit_ts | timestamptz NOT NULL |
| command_counter | integer NOT NULL |
| remote_xid bigint | NOT NULL |
| local_origin | oid |
| local_commit_ts | timestamptz |
| table_schema | text |
| table_name | text |
| operation | text |
| local_tup | jsonb |
| remote_old_tup | jsonb |
| remote_new_tup | jsonb |
| ddl_statement | text |
| ddl_user | text |
| error_message | text NOT NULL |
| retry_errored_at | timestamptz NOT NULL |
| PRIMARY KEY | Compound: remote_origin, remote_commit_ts, command_counter |


### Using spock.repair_mode() when Repairing Transactions

Spock includes a function that you can control at the PSQL command line that places your cluster into *repair mode* while you modify data. The function is useful when fixing errors recorded in the exception log table, but can also be used in other situations where you need to interrupt replication. 

Before you start repairing a transaction, set `spock.repair_mode` to `true` to interrupt replication to other nodes:

`SELECT spock.repair_mode(true);`

When you `COMMIT` or `ROLLBACK` a transaction, `spock.repair_mode` is returned to `false` automatically. 

In the following example, the row that contains (`3`,`Smith`,`sales`) already exists on `n2`, but does not exist on `n1`. To remediate the issue, you can perform the following steps on `n1` to add this row without it replicating to `n2`: 

```sql
demo=# BEGIN;
BEGIN
demo=*# SELECT spock.repair_mode('True');
-[ RECORD 1 ]----------
repair_mode | 0/1C5AFD0

demo=*# INSERT INTO employeeid VALUES (`3`,`Smith`,`sales`);
INSERT 0 1
demo=*# COMMIT;
```

### Repairing Transactions when `spock.exception_behaviour` is in `sub_disable` Mode

If you use `spock.exception_behaviour` in `sub_disable` mode, a failed operation will disable the subscription for the node on which the exception was reported until you manually intervene. The transaction that caused the exception is the first transaction added to a queue that is then written to the WAL log file until that node is brought back into the subscription. To repair a node with `sub_disable` on, use the following steps:

Based on the entries in the exception log, repair the disabled node. After repairing the node, you can:

  * Perform the first transaction in the WAL log manually, and use `spock.alter_sub_skip_lsn` to skip the first transaction in the WAL log when you resume processing.
  * Resume transaction processing with the transaction that caused the node to become disabled, followed by the rest of the queue from the WAL log file.

If you opt to manually perform the transaction that took the node out of the cluster, you will need to skip that transaction in the WAL log before you enable the subscription. To skip the first transaction in the WAL log, use the `spock.alter_sub_skip_lsn` function, specifying the transaction LSN from the exception log.  To skip the transaction, connect with a Postgres client (like psql) and use the command:

`SELECT spock.alter_sub_skip_lsn(LSN_of_transaction);`

Then, exit the client application and return the node to the cluster with the command:

`pgedge spock sub-enable subscription_name db_name`

  Note that if you return the node to a cluster without repairing the cause of the initial failure, replaying the transaction that caused the initial failure will cause the failure to recur.

## Logged Exception Types

The following examples demonstrate the types of replication errors that might be logged to the exception table. This is not a comprehensive list of logged errors.

### Missing Primary Key Exception

In the following example:

* Node `n1` has two records in our sample table (`foo`) with primary key values of `1` and `2`.
* Node `n2` has three records in our sample table (`foo`) with primary key values of `1`, `2`, and `3`.

Both tables are added to replication, and then the row with a primary key value of `3` is updated on `n2`. This row is successfully updated on `n2`, but when replicated to `n1` a row with a primary key value of `3` is not found. 

If this error occurs while the exception behavior GUCs are set to their default values, the following entry is captured in the `spock.exception_log` table:

```sql
demo=# SELECT * FROM spock.exception_log;
-[ RECORD 1 ]----+---------------------------------------------------------------------------------------------------
remote_origin	| 26863
remote_commit_ts | 2024-07-02 19:10:04.317346+00
command_counter  | 1
remote_xid   	| 756
local_origin 	|
local_commit_ts  |
table_schema 	| public
table_name   	| foo
operation    	| UPDATE
local_tup    	|
remote_old_tup   |
remote_new_tup   | [{"value": 3, "attname": "a", "atttype": "int4"}, {"value": 2, "attname": "b", "atttype": "int4"}]
ddl_statement	|
ddl_user     	|
error_message	| logical replication did not find row to be updated in replication target relation (public.foo)
retry_errored_at | 2024-07-02 19:10:05.058789+00
```

### Duplicate Primary Key Exception 

In the following example:

* Node `n1` has one record in our sample table (`foo`) with a primary key value of `1`.
* Node `n2` has two records in our sample table (`foo`) with primary key values of `1` and `2`.

After adding both tables to the replication set, we update the `foo` table on `n1`, adding a row with a primary key value of `2`. The row is successfully inserted on `n1`, but when replicated to `n2`, the addition results in a duplicate primary key error. 

If this error occurs while the exception behavior GUCs are set to their default values, the following entry is captured in the `spock.exception_log` table:

```sql
remote_origin	| 49708
remote_commit_ts | 2024-07-02 19:07:09.602248+00
command_counter  | 1
remote_xid   	| 747
local_origin 	|
local_commit_ts  |
table_schema 	| public
table_name   	| foo
operation    	| INSERT
local_tup    	|
remote_old_tup   |
remote_new_tup   | [{"value": 2, "attname": "a", "atttype": "int4"}, {"value": 3, "attname"
: "b", "atttype": "int4"}]
ddl_statement	|
ddl_user     	|
error_message	| duplicate key value violates unique constraint "foo_pkey"
retry_errored_at | 2024-07-02 19:07:10.298847+00
```

### DDL Exception

In the following example:

* Node `n1` has one row in our sample table (`foo`) with columns `a`, `b`, and `c`.
* Node `n2` has one row in our sample table (`foo`) with columns `a` and `b`. 

If we then enable Auto DDL (to replicate DDL statements through the `default` replication set) and manually perform an update statement to drop column `c` from `n1`, the DDL statement is replicated to `n2`. Since the table (`foo`) on `n2` does not have this column, the update statement returns an `ERROR`: `“column "c" of relation "foo" does not exist”`.

If this error occurs while the exception behavior GUCs are set to their default values, the following entry is captured in the `spock.exception_log` table:

```sql
demo=# select * from spock.exception_log;
-[ RECORD 1 ]----+-------------------------------------------------------------------------
remote_origin	| 49708
remote_commit_ts | 2024-07-02 17:01:32.837093+00
command_counter  | 1
remote_xid   	| 744
local_origin 	|
local_commit_ts  |
table_schema 	| spock
table_name   	| queue
operation    	| INSERT
local_tup    	|
remote_old_tup   |
remote_new_tup   | [{"value": "2024-07-02T17:01:32.83675+00:00", "attname": "queued_at", "a
tttype": "timestamptz"}, {"value": "pgedge", "attname": "role", "atttype": "name"}, {"value
": ["default_insert_only"], "attname": "replication_sets", "atttype": "_text"}, {"value": "
D", "attname": "message_type", "atttype": "char"}, {"value": "SET search_path TO \"$user\",
 public; alter table foo drop column c", "attname": "message", "atttype": "json"}]
ddl_statement	|
ddl_user     	|
error_message	|
retry_errored_at | 2024-07-02 17:01:33.609419+00
-[ RECORD 2 ]----+-------------------------------------------------------------------------
remote_commit_ts | 2024-07-02 17:01:32.837093+00
command_counter  | 2
remote_xid   	| 744
local_origin 	|
local_commit_ts  |
table_schema 	|
table_name   	|
operation    	| DDL
local_tup    	|
remote_old_tup   |
remote_new_tup   |
ddl_statement	| SET search_path TO "$user", public; alter table foo drop column c
ddl_user     	| pgedge
error_message	| column "c" of relation "foo" does not exist
retry_errored_at | 2024-07-02 17:01:33.610043+00
```

## Exception Log Limitations

The following cases are not currently captured by the exception log table:

* A mismatched number of columns: If `n1` has 3 columns in a table, while `n2` has 2 columns in the same table, an `INSERT` into the table on `n1` will cause uncaptured exception on `n2`.
* Data anomalies resulting from columns with different data types. 