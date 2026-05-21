# Creating a New Database

To create a new database, select the `Databases` node in the navigation
tree control, then select the `+ New Database` icon in the upper-right
corner of the page. When the `Create New Database` dialog opens, use
the fields to define the database.

![Creating a Database](../images/create_new_db.png)

- Provide a name for the database in the `Database Name` field.

- Optionally, provide a `Display Name` to identify the database in the
  navigation tree control. If more than one database shares the same
  name, a `Display Name` helps identify each database in the navigation
  tree control.

- Use the `PostgreSQL Version` drop-down to select the version of
  PostgreSQL to install.

The dialog displays the available clusters and their deployment regions.
Use the `Show Map` toggle to display or hide a map of node locations.

![Creating a Database](../images/create_new_db_cluster_map.png)

Select the cluster to host the new database from the panes displayed
under `Select a Cluster`. Use the checkboxes in each host's selector to
indicate whether the database should be deployed on that host; remove
the check to exclude a specific location.

The `Backup Configuration` pane provides options to customize the
backup configuration for Enterprise Edition database backups.

![Selecting a Backup provider](../images/select_backup_provider.png)

Use the fields in this section to customize the backup strategy; select
the `edit` icon (a pencil) in the upper-right corner to modify backup
settings. The default configuration defines a schedule that includes a
daily full backup with hourly incremental backups. Use the
`Add Configuration` button to
[create a custom schedule](../backup/backup_providers.md) for the
database.

!!! note

    A backup configuration and the selected database backup provider
    cannot be modified after database deployment.

The `Options` section displays optional features available when the
database is provisioned:

![Selecting database options](../images/create_db_options.png)

- Use the toggle switch next to `Enable AWS CloudWatch Metrics` to share
  metrics with [AWS CloudWatch](https://aws.amazon.com/cloudwatch/).

Use the `Services` section to add an
[MCP server](https://docs.pgedge.com/pgedge-postgres-mcp-server/v1-0-0/)
or [RAG server](https://docs.pgedge.com/pgedge-rag-server/v1-0-0/) to
the installation.

![Selecting database services](../images/create_db_services.png)

* Select the `+ MCP Server` button to add MCP server details for the
database; for more information, see 
[Adding an MCP or RAG Server](../services.md).

* Select the `+ RAG Server` button to add MCP server details for the
database; for more information, see 
[Adding an MCP or RAG Server](../services.md).
  
After making selections, select `Create Database` to initialize a
PostgreSQL database and start replicating data between the nodes in
the cluster. The new database is added to the list of databases in the
left pane of the console; a green dot to the left of the name indicates
that the database is available for connections.

![Initializing a Cluster](../images/initializing.png)

