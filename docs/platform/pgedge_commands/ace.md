# ACE Commands

Commands in the `ace` module include:

| Command  | Description |
|----------|-------------|
| [repset-diff](doc/ace-repset-diff.md) | Loop thru a replication-set's tables and run table-diff on them. |
| [schema-diff](doc/ace-schema-diff.md) | Compare schemas on different cluster nodes. |
| [spock-diff](doc/ace-spock-diff.md) | Compare Spock meta data setup on different cluster nodes. |
| [table-diff](doc/ace-table-diff.md) | Efficiently compare tables across cluster using checksums and blocks of rows. |
| [spock-exception-update](doc/ace-spock-exception-update.md)| Updates the Spock exception status for a specific cluster and node. |
| [table-repair](doc/ace-table-repair.md) | Apply changes from a table-diff source of truth to destination table. |
| [table-rerun](doc/ace-table-rerun.md) | Re-run differences on the results of a recent table-diff. |
