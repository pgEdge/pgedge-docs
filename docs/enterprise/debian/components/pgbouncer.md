# Using pgBouncer with pgEdge Enterprise Postgres

PgBouncer is a lightweight connection pooler designed to work with Postgres. Before installing and configuring PgBouncer in a pgEdge Enterprise Postgres cluster, 
[install and initialize](../installing.md#installing-pgedge-enterprise-postgres-and-controlling-the-cluster) 
the Postgres database.

Then, you can install PgBouncer from the `pgedge` repository with the command:

`sudo dnf install pgedge-pgbouncer`

After installing pgBouncer, copy the sample `userlist.txt` to the PgBouncer
configuration directory:

`sudo cp /usr/share/doc/pgbouncer/userlist.txt /etc/pgbouncer/`

Next, edit `/etc/pgbouncer/userlist.txt` and add your database user
credentials. Entries in the file take the form:

`"postgres" "your_password_here"`

Next, make sure the file has the correct permissions; use the command:

`sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt sudo chmod 600 \
/etc/pgbouncer/userlist.txt`

Before using pgBouncer, you'll need to share system configuration details in
the `/etc/pgbouncer/pgbouncer.ini` file; modify the file to match your
system. Provide database connection info, listener port, and other options
as needed.

Next, ensure that your Postgres server is up and running on the target port
and start the PgBouncer service with the command:

`sudo systemctl start pgbouncer`

You can use the following command to check the status of the pgBouncer
service:

`sudo systemctl status pgbouncer`

To connect to your Postgres database through PgBouncer connection pooling,
use the command:

`psql -p 6432 -U your_username -d pgbouncer`

Note that `your_username` is a database user included in the
`/etc/pgbouncer/userlist.txt` file.