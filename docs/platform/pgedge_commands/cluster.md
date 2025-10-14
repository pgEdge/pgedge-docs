# CLUSTER Commands

Commands in the `cluster` module include:

| Command  | Description
|----------|-------------
| [app-concurrent-index](doc/cluster-app-concurrent-index.md) | Updates the Spock exception status for a specified cluster and node.
| [add-node](doc/cluster-add-node.md) | Adds a new node to a cluster, copying configuration details from a specified source node.
| [app-install](doc/cluster-app-install.md) | Install a test application (`pgbench` or `Northwind`).
| [app-remove](doc/cluster-app-remove.md)  | Remove a test application (`pgbench` or `Northwind`) from cluster.
| [command](doc/cluster-command.md) | Run a `CLI` command on one or all nodes of a cluster.
| [init](doc/cluster-init.md) | Install pgEdge Distributed Postgres on each node, create the initial database, install Spock,and create all Spock nodes and subscriptions.
| [json-create](doc/cluster-json-create.md) | Create a .json file template to define a cluster.
| [json-template](doc/cluster-json-template.md) | Create a .json file template to define a cluster that resides on remote hosts (deprecated).
| [json-validate](doc/cluster-json-validate.md) | Check the validity of a .json file.
| [list-nodes](doc/cluster-list-nodes.md) | List all nodes in the cluster.
| [remove-node](doc/cluster-remove-node.md) | Remove a node from the cluster.
| [remove](doc/cluster-remove.md) | Remove a cluster. This will remove Spock subscriptions and nodes, and then stop Postgres on each node. If the flag force is set to `true`, then it will also remove the installation directory on each node.
| [replication-begin](doc/cluster-replication-begin.md) | Add all tables in the database to replication on every node.
| [replication-check](doc/cluster-replication-check.md) | Print replication status about every node.
| [ssh](doc/cluster-ssh.md) | Opens an SSH terminal session into the specified node.
