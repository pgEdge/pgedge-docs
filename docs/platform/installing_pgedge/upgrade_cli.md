# Upgrading pgEdge Distributed Postgres (VM Edition)

To upgrade pgEdge Distributed Postgres (VM Edition), perform the following steps on each node that uses the older version:

1. Navigate into the `pgedge` installation directory and ensure you are pointing to the correct repository:

    `./pgedge info`

    This command will display the version (for example, 24.10.8) and the repository that the CLI is pointing to.

2. Refresh the metadata to view available component upgrades: 

    `./pgedge update`

    Please note that this command will only update the metadata and display information about available components (installed version and upgrade versions available); to upgrade, you must run the upgrade script. 

3. Run the CLI upgrade script: 

    `python3 -c "$(curl -fsSL $REPO/upgrade-cli.py)"`

    This script will upgrade the CLI only. After the upgrade, the command displays the new CLI version and all available upgrades for supporting components.

4. Validate the upgraded cli version (24.10-10):

    `./pgedge info`

## Upgrading pgEdge Platform Components

Use the following command to list all supported components and available versions: 

`./pgedge um list`

To upgrade a platform component such as the Spock extension, invoke the upgrade command for corresponding component:

`./pgedge um upgrade spock`

Each listed component can be similarly upgraded using the component name displayed by the `pgedge um list` command. 

