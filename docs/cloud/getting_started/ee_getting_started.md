# Getting Started with pgEdge Postgres Cloud Edition

Getting started with pgEdge Postgres Cloud edition is easy; simply navigate to
[the pgEdge sign-in page](https://app.pgedge.com/login?plan=developer&screen_hint=signup)
and follow the provided link to create an account, or log in with your Google
or Github account.

![pgEdge Cloud Edition login](../images/cloud_login.png)

If this is your first time logging in, you are welcomed to the free trial
of pgEdge Cloud.

![pgEdge Cloud Edition free trial](../images/cloud_trial.png)

pgEdge Cloud uses resources provisioned on your choice of cloud provider;
Cloud can create and manage clusters created on:

* AWS
* Azure
* Google

When you create a cluster, pgEdge provisions your cluster's supporting
resources on that provider as well - those resources include:

* Backup stores
* SSH keys

Before creating your first cluster, you need to link your Cloud provider
account with pgEdge. 

![Linking a Cloud Account](../images/gs_link_cloud_account.png) 

Information panes in the center of the page list the credentials and artifacts
you will need to create an account with each provider, as well as a link to
the provider-specific `Setup guide` for detailed information about linking
your account. 

When you're ready to get started, select the `Link Cloud Account` button to
choose your cloud provider.

![Selecting a Cloud Provider](../images/gs_select_provider.png)

Choose your provider to open the account details dialog and provide the
information required by each provider to deploy on Cloud.

![Provide Cloud Provider details](../images/gs_account_details.png)

If you're [deploying on AWS](../prerequisites/cloud_accounts/link_to_AWS.md),
you can use the `Create Stack Wizard` to use a completed AWS CloudFormation
template to create an AWS role with the required permissions; use the link
circled in red above to navigate to the wizard and retreive your ARN.

When you've finished adding a provider account, the new account is displayed
on the `Cloud Accounts` page, and the progress dialog is updated.

![Progress tracker](../images/gs_progress_one.png)

Next, you'll create a backup store.  You can use the link on the progress
tracker (shown above) to navigate to a screen that displays information about
backup stores, with a link to a page where you can define a backup store on
your preferred provider.

![Create a Backup Store](../images/gs_backup_store.png)

Select [Create Backup Store](../cluster/backup_store.md)
to navigate to the `Create Backup Store` dialog; complete the dialog and
click `Create Backup Store` to continue.

When you've finished defining the backup store, the store is displayed on the
`Backup Stores` dialog, and the progress tracker advances, prompting you to
import an SSH key.

![Progress tracker](../images/gs_progress_two.png)

Next, you'll [import an SSH key](../prerequisites/ssh_key.md).  You can use
the link on the progress tracker to navigate to an informational page with
links to more information about importing keys.

![Import an SSH Key](../images/gs_import_ssh_key.png)

When you're ready, select the `Import SSH Key` button to advance to the import
page. When you've finished importing an SSH key, the progress tracker advances
and you can see the imported SSH key on the `SSH Keys` dialog.

![Progress tracker](../images/gs_progress_three.png)

Next, you'll [create a cluster](../cluster/create_cluster.md).  You can use
the link on the progress tracker to navigate to a page with more information
about cluster creation and handy links.

![Select Create Cluster](../images/gs_create_cluster.png)

To create a cluster, click the `Create Cluster` button; when you've 
finished creating a cluster, the progress tracker advances, and you can see
the imported cluster definition on the `Clusters` page.

![Progress tracker](../images/gs_progress_four.png)

Next, you'll [create a database](../cluster/create_database.md).  You can use
the link on the progress tracker to navigate to the database creation page.

![Select Import SSH Key](../images/gs_create_database.png)

When you're ready, select `Create Database` to create your new database and
exit the progress tracker.





























## pgEdge Resources

Use the links in the lower-left corner of the console to access pgEdge
resources:

* For an invitation to the pgEdge Discord server, select the `Community`
  link.
* To review the documentation, select the `Docs` link.
* To review or modify account settings (including API Clients), select the
  `Settings` link.
* To review and manage team settings, select the `Team Management` link.
