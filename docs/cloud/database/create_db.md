# Creating a New Database

To create a new database, select the `Databases` node in the navigation tree
control; then, select the `+ New Database` icon located in the upper-right
corner of the page. When the `Create New Database` dialog opens, use the
fields on the dialog to define your database.

![Creating a Database](../images/create_new_db.png)

* Provide a name for the database in the `Database Name` field.

* Optionally, provide a `Display Name` to identify the database in the
  navigation tree control.  If you have more than one database with the same
  name, a `Display Name` can help you easily identify each database in the
  navigation tree control.

* Use the `PostgreSQL Version` drop-down to select the version of Postgres
  that you would like to install.

Select the cluster you would like to host your new database from the options
shown under `Select a Cluster`.  Use the `Show Map` toggle to display a map
of the node locations for the selected cluster.

![Creating a Database](../images/create_new_db_cluster_map.png)

The dialog displays your clusters and their deployment regions. Check the box
in a cluster pane to deploy on that cluster.
 
The `Backup Configuration` pane allows you to customize the configuration you
wish to use for your Enterprise Edition database backups.

![Selecting a Backup provider](../images/select_backup_provider.png)

Use fields in this section to customize the backup strategy; select the `edit`
icon (a pencil) in the upper-right corner to modify backup settings. The 
default configuration defines a schedule that includes a daily full backup,
with hourly incremental backups. Use the `Add Configuration` button to
[create a custom schedule](../backup/backup_providers.md) for your database.

!!! note

    You cannot modify a backup configuration or your selected database
    backup provider after database deployment.

The `Options` section displays optional features you can enable when your
database is provisioned:

![Selecting database options](../images/create_db_options.png)

* Use the toggle switch next to `Install Northwind Database` to install the
  Northwind sample database and schema objects. 
* Use the toggle switch next to `Enable AWS CloudWatch Metrics` to share
  metrics with [AWS CloudWatch](https://aws.amazon.com/cloudwatch/).

After making your selections, click `Create Database` to initialize a
Postgres database and start replicating data between the nodes in the
cluster. Your new database is added to the list of databases in the left pane
of the console; a green dot to the left of the name indicates that the
database is available for connections.

![Initializing a Cluster](../images/initializing.png)

