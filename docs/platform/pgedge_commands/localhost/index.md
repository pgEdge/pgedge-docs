# LOCALHOST Commands

Commands in the `localhost` module include:

| Command  | Description
|----------|-------------
| [cluster-create](doc/localhost-cluster-create.md) | Create a local cluster. Each node will be located in the cluster/<cluster_name>/<node_name> directory. Each database will have a different port.
| [cluster-destroy](doc/localhost-cluster-destroy.md)  | Destroy a local cluster. This will stop PostgreSQL on each node, and then remove the `pgedge` directory for each node in a local cluster.