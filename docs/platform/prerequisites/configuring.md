# Designing a Schema for Active-Active Replication

When designing a schema, you should ensure that you:

**Include a Primary Key in Each Table** 

All tables must include a primary key; this allows the Spock extension to replicate `INSERT`, `UPDATE`, and `DELETE` statements. If your table does not include a primary key, only `INSERT` statements will be replicated to the table.

**Use Snowflake Sequences for Robust Sequence Support** 

If you use a Postgres [sequence](https://www.postgresql.org/docs/17/sql-createsequence.html) as part of your primary key, you should convert your sequences to Snowflake sequences. 

Snowflake sequences are composed of multiple data types that ensure a unique transaction sequence when processing your data in multiple regions. This helps Spock accurately preserve the order in which globally distributed transactions are performed, and alleviates concerns that network lag could disrupt sequences in distributed transactions.

**Start with Identical Schema Objects on Each Node** 

Before enabling Automatic DDL replication, you must ensure that all schema objects exist on each node of the cluster before starting replication. If you start replication between schemas that don't match, pgEdge will return an error (object not found).

!!! info

    Functions, triggers, views, and other non-data schema objects must be maintained in tandem on each node if used by any process involved with replication; enabling automatic DDL replication can help you maintain identical schemas across your nodes.

If an object is not involved in replication or actively used by another replicated process, it can reside in the schema, but will be ignored.

**Include the ENABLE ALWAYS clause in Triggers** 

PostgreSQL triggers will fire only from the node on which they were invoked. If you have triggers that are related to the replication process, you should include the `ENABLE ALWAYS` clause when attaching a trigger to a table:

```
CREATE TRIGGER ins_trig AFTER INSERT ON my_table FOR EACH ROW EXECUTE PROCEDURE ins_history();
ALTER TABLE trans_history ENABLE ALWAYS TRIGGER ins_trig;
```

**Use Conflict-Free Delta-Apply Columns**

Replicated systems used heavily for transaction processing have to ensure that in the event of a transaction conflict, transactions are applied in order to maintain an accurate running balance.  Making your NUMERIC columns conflict-free delta-apply columns ensures that transactions are applied to an account in the order that they're received.  
 
!!! info

    Use a conflict-free delta-apply column to ensure that the value replicated is the delta of the committed changes (the old value plus or minus any new value) to a given record.

On Spock extension 4.0 (or later), connect with psql and use the following command to update a column to a delta-apply column:

```sql
ALTER TABLE table_name ALTER COLUMN column_name SET (log_old_value=true, delta_apply_function=spock.delta_apply);
```