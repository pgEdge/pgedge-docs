
# pgEdge Distributed Postgres (Cloud Edition) Release Notes

## 08/20/2025

* [Multi-AZ Node Placement](../cloud/cluster/create_cluster.md) allows you to deploy multiple nodes within a single region across different Availability Zones (AZs), improving fault tolerance and supporting high-availability topologies. Nodes can be individually assigned to any supported AZ during cluster setup.

* Spock 5.0 is now the default version of Spock used by Cloud. Spock 5.0 is our next-generation logical replication engine, bringing improved performance, expanded automatic conflict resolution, and more accurate lag tracking.

* External VPC association support; Cloud now supports associating external VPCs with your pgEdge Cloud clusters, allowing applications in those VPCs to securely connect and benefit from the built-in DNS resolution and failover capabilities of the platform.

* An improved [Cluster Overview](../cloud/cluster/manage_cluster.md) page has been enhanced to display the currently configured firewall rules and any associated VPCs, making network configuration and debugging easier and more transparent.

## 06/24/2025

The database and cluster log viewer now has a control that allows you to manually control the log viewer refresh; you can stop auto-refresh, resume auto-refresh, or manually update the displayed logs.

## 04/14/2025

pgEdge has made several several usability enhancements to the Log Viewer; this update adds: 

* You can now sort log files by toggling the ascending/descending column icon.
* A search feature highlights a search term, and allows you to step through rows containing the search string.
* For logs that contain a `Level` column, a filter now allows you to sort by a specific event status (eg: `INFO` or `WARNING`).

## 03/26/2025

This update adds: 

* [Cross-Database Restore](https://docs.pgedge.com/cloud/backup/restore).
You can now restore a database from a backup performed on a different database. When selecting the backup to restore, you can now select from a list of available databases, and then choose a backup from that database’s available backups for restoration.

  It is important to note that the databases must reside in clusters that are attached to a common backup store for backups to be available for cross-database restore.

* Support for Cloudwatch for private DNS health checks on AWS.  Cloudwatch metrics can now be leveraged for private DNS health checks, in the same manner as public DNS.  This allows latency based routing to route to the next node in line in case of node failure or maintenance.
    * The cluster must be private (this feature was already available for public clusters).
    * The database must have Cloudwatch metrics enabled.

  See [*Connection Best Practices*](https://docs.pgedge.com/cloud/connecting/best_practices) in the pgEdge documentation for more information.

## 01/31/2025 


This update adds the [Profile tab](https://docs.pgedge.com/cloud/settings#the-profile-tab) to the [`Settings` dialog](https://docs.pgedge.com/cloud/settings), allowing you to modify your profile information.  You can access the tab by clicking your user icon in the top-right of the pgEdge Cloud UI, or by navigating through the `Settings` option on the navigation pane to the Profile tab.

## 01/29/2025

This update:
* Introduces a [new database metric](https://docs.pgedge.com/cloud/database_admin/metrics) called pg_maintenance which reports whether a database is in maintenance mode.
* Fixes an issue where [database metrics](https://docs.pgedge.com/cloud/database_admin/metrics) might not be delivered after restarts or restore operations.
* Fixes an issue where replication sets might not be properly re-established after a restore.
* Fixes an issue where leftover pg_replication_origin values would persist after a restore.
* Fixes an edge case where restoring a backup with previously removed nodes would cause leftover subscriptions to occur between nodes.
* Improves display of [database and cluster metrics](https://docs.pgedge.com/cloud/database_admin/metrics) in the pgEdge Cloud UI with better labels and size conversions.

## 12/27/2024

This update fixes a rare case where certain updates involving NULL values or TOASTed values may not be properly replicated. 

## 12/09/2024 

This update adds a new feature to the User interface, allowing you to provide an optional [Display Name](https://docs.pgedge.com/cloud/database/create_db#creating-a-new-database) for a database within the pgEdge Cloud UI. If you have more than one database with the same name, a Display Name can help you easily identify each database in the navigation tree control.

## 12/02/2024 

This update adds Postgres 17 as an optional database version for deployment on a cluster. 

The update also introduces new database metrics for pg_spock_exception_log_rate and pg_spock_resolutions_rate , allowing you to monitor the rate of exception log entries or resolutions on each node.

## 11/20/2024

This update allows you to [modify your existing cluster firewall rules](https://docs.pgedge.com/cloud/cluster/firewall#adding-or-modifying-firewall-rules) from the pgEdge Cloud UI. 

## 09/30/2024 

pgEdge Cloud pgEdge Distributed Postgres: Cloud Edition Enterprise Edition has reached General Availability. Visit [here](https://www.pgedge.com/press-releases/pgedge-announces-general-availability-of-pgedge-cloud-enterprise-edition) to review the press release!

