# Configuring Supporting Components

Components distributed via the `pgedge` repository follow standard configuration and usage for the individual components with the exceptions noted below.

## Using Spock with pgEdge Enterprise Postgres

To configure a two-node replication cluster after installing the Spock extension with pgEdge Enterprise Postgres, follow the detailed instructions [here](https://github.com/pgEdge/spock/blob/main/docs/two_node_cluster.md).

## Using pgBackRest with pgEdge Enterprise Postgres

Detailed configuration and usage information for pgBackRest is available [here](../../platform/managing/pgbackrest.md).

## Using pgBouncer with pgEdge Enterprise Postgres

PgBouncer is a lightweight connection pooler designed to work with Postgres. After configuring the `pgedge` repo, you can install PgBouncer with the command:

`sudo dnf install pgedge-pgbouncer` 

After installing pgBouncer, copy the sample `userlist.txt` to the PgBouncer configuration directory:

`sudo cp /usr/share/doc/pgbouncer/userlist.txt /etc/pgbouncer/` 

Next, edit `/etc/pgbouncer/userlist.txt` and add your database user credentials. Entries in the file take the form:

`"postgres" "your_password_here"` 

Next, make sure the file has the correct permissions; use the command:

`sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt sudo chmod 600 /etc/pgbouncer/userlist.txt` 

Before using pgBouncer, you'll need to share system configuration details in the `/etc/pgbouncer/pgbouncer.ini` file; modify the file to match your system. Provide database connection info, listener port, and other options as needed.

Next, ensure that your Postgres server is up and running on the target port and start the PgBouncer service with the command:

`sudo systemctl start pgbouncer` 

You can use the following command to check the status of the pgBouncer service:

`sudo systemctl status pgbouncer` 

To connect to your Postgres database through PgBouncer connection pooling, use the command:

`psql -p 6432 -U your_username -d pgbouncer` 

Note that `your_username` is a database user included in the `/etc/pgbouncer/userlist.txt` file.