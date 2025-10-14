# The pgEdge Distributed Postgres Command Line Interface (CLI)

The CLI is the command line interface that you can use to simplify component installation and management for pgEdge Distributed Postgres. CLI commands can help you stand up and manage a multi-master active-active Postgres database. The individual modules are: 

| Module | Description |
|--------|-------------|
| [ace](ace.md) | Use `ACE` to compare the data on different nodes to confirm data consistency. |
| [cluster](cluster.md) | Calls to the `cluster` module install and configure your replication scenario. | 
| [db](db.md) | Use calls to the `db` module to configure and control your PostgreSQL databases. |
| [localhost](localhost.md) | Use commands in the `localhost` module to manage clusters on your local host. |
| [service](service.md) | Calls to the `service` module control the state of services. |
| [setup](setup.md) | Setup a pgEdge node with configuration for user, database, port, version, spock, snowflake. |
| [spock](spock.md) | Use calls to `spock` to manage your replication cluster. |
| [um](um.md) | Use calls to `update manager` to list, install, and update components. |


## CLI Command Synopsis

`./pgedge <module_name> <command> [parameters] [options]`

When calling a `CLI` command, specify the name of the module, followed by the command name and any 
command options. 

To review available help, use the command:

`./pgedge --help`

To review help for a specific module, use the command:

`./pgedge <module_name> --help`

For information about the installed version of the CLI and other system details, use the command: 

`./pgedge info`