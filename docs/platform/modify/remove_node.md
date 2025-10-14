# Removing a Node from a Cluster

To help manage node removal, the CLI's `cluster` module includes the `remove-node` command. If your cluster has at least 3 nodes, you can use the `cluster remove-node` command to gracefully remove a node and update the cluster JSON file to accurately reflect the new cluster definition.  The syntax is: 

`./pgedge cluster remove-node <cluster_name> <node_name>`

Before removing a node, you should first ensure that your application is no longer writing to the node; if your application is writing to a node and you remove the node before the node has an opportunity to replicate that content, you will lose the transaction. 

When invoking the `cluster remove-node` command, provide the cluster name and the name of the node to be removed from that cluster. For our example, we'll remove `n3`:

`./pgedge cluster remove-node demo n3`

The command sets `n3` into `read-only` mode, so no `INSERTS`, `UPDATES`, or `DELETES` can happen on that node. Once the node is set into `read-only` mode, the CLI ensures that all replication from `n3` to nodes `n1` and `n2` has been completed, and that it is safe to remove `n3` from the cluster. Subscriptions between `n1` and `n3` and between `n2` and `n3` are then dropped, PostgreSQL stops on `n3`, and the cluster JSON definition is updated to no longer include `n3` as a node. 

```sql
/home/ec2-user/work/platform_test/nc/pgedge/cluster/demo/n1
[ec2-user@ip-172-31-30-56 n1]$ cd ../../../
[ec2-user@ip-172-31-30-56 pgedge]$ ./pgedge cluster remove-node demo n3
July 11, 2024, 17:06:20: 127.0.0.1 : n1 - Checking ssh on 127.0.0.1                                 [OK]
July 11, 2024, 17:06:20: 127.0.0.1 : n2 - Checking ssh on 127.0.0.1                                 [OK]
July 11, 2024, 17:06:21: 127.0.0.1 : n3 - Checking ssh on 127.0.0.1                                 [OK]
July 11, 2024, 17:06:23: 127.0.0.1 : n1 - Dropping subscriptions sub_n1n3                           [OK]
July 11, 2024, 17:06:25: 127.0.0.1 : n2 - Dropping subscriptions sub_n2n3                           [OK]
July 11, 2024, 17:06:27: 127.0.0.1 : n3 - Dropping subscription sub_n3n1                            [OK]
July 11, 2024, 17:06:29: 127.0.0.1 : n3 - Dropping subscription sub_n3n2                            [OK]
July 11, 2024, 17:06:30: 127.0.0.1 : n3 - Dropping node n3                                          [OK]
July 11, 2024, 17:06:32: 127.0.0.1 : n1 - Listing spock nodes                                       [OK]

[
  {
    "node_id": 673694252,
    "node_name": "n1"
  },
  {
    "node_id": 560818415,
    "node_name": "n2"
  }
]

July 11, 2024, 17:06:33: 127.0.0.1 : n2 - Listing spock nodes                                       [OK]

[
  {
    "node_id": 673694252,
    "node_name": "n1"
  },
  {
    "node_id": 560818415,
    "node_name": "n2"
  }
]

July 11, 2024, 17:06:34: 127.0.0.1 : n3 - Listing spock nodes                                       [OK]
[]
```

When the command finishes, you can back up and delete the `data` directory on `n3` and decommission the server. 

### Limitations

Once removed, a node cannot rejoin the cluster until you remove all files and directories that were used by the previous cluster. This clean-up includes removal of Postgres and any files or directories (like the `data` directory) that are used and managed by your replicating cluster. 