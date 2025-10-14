# Using Spock --Synchronize Options to Simplify Setup

The pgEdge Distributed Postgres (VM Edition) command-line interface (the CLI) facilitates calling Spock extension commands from pgEdge Postgres. The [`spock sub-create`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-sub-create) command includes two options that you can use to simplify replication configuration:

```sql
spock sub-create --synchronize_data
spock sub-create --synchronize_structure
```

The `sub-create --synchronize` options pull information to a node when you define a subscription, saving you the inconvenience of manually duplicating the table structure and data. You can specify the options individually or together.

To use the `--synchronize` options:

1. Configure your first replication node; when setting up the node, make the node a member of the `default` replication set. 

2. Use the [`spock node-create`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-node-create) command to define the subscribing node.

3. Use the [`spock sub-create`](https://docs.pgedge.com/platform/pgedge_commands/doc/spock-sub-create) command to subscribe the new node to the node created in step 1, and include:

  * `spock sub-create --synchronize_data` to pull data over to the new node from the existing node. Note that the table must exist on the new node in the same form as the table defined on node 1.
  * `spock sub-create --synchronize_structure` to pull the table structure(s) over to the new node from the existing node. Note that the `--synchronize_structure` option can only create those objects that do not exist on the new node.
  * Include both options to pull the structure definition and data to the new node.

4. After syncing the data and/or structure, use the CLI to [install and create any extensions](https://docs.pgedge.com/platform/managing/supported_extensions) you use on the new node:

`pgedge um install extension_name`


**Example**

In the following example, if the table and data that we want to replicate is on a node named `n1`:

`spock node-create n1 'host=10.0.0.8 user=replication_user dbname=acctg' acctg`

Where `n1` is a member of the `default` replication set:

`spock repset-add-table default 'public.customers' acctg`

We can create a node named `n2`:

`spock node-create n2 'host=10.0.0.5 user=replication_user dbname=acctg port=5432' acctg`

Then, in the command to subscribe `n2` to `n1`, include the `--synchronize` flags: 

`spock sub-create sub_n2n1 'host=10.0.0.8 port=5432 user=replication_user dbname=acctg' acctg --synchronize_structure=True --synchronize_data=True`

The table structure will be recreated on `n2`, and populated with the data from `n1`.