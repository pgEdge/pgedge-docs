# Configuring Supporting Components

Many of the supporting components distributed via the `pgedge` repository follow standard configuration and usage as documented by their open-source projects.  

Package names and links to the component documentation are noted in the table below. `XX` in the package name indicates the package version; substitute your preferred version into the package name (i.e. pgedge-postgresql-18-snowflake) when installing the package to ensure you've installed the version that matches your copy of Postgres.

| Component | Package Name | Details and Links |
|-----------|--------------|-------------------|
| Spock     | pgedge-postgresql-XX-spock50 | [Configuration and Usage](https://github.com/pgEdge/spock/blob/main/README.md) |
| Snowflake | pgedge-postgresql-XX-snowflake | [Configuration and Usage](https://github.com/pgEdge/snowflake/blob/main/README.md) |
| Lolor     | pgedge-postgresql-XX-lolor | [Configuration and Usage](https://github.com/pgEdge/lolor/blob/main/README.md) |
| PostGIS | pgedge-postgresql-XX-postgis-3 | [Configuration and Usage](https://postgis.net/documentation/) |
| pgvector | pgedge-postgresql-XX-pgvector | [Configuration and Usage](https://github.com/pgvector/pgvector) |
| pgaudit | pgedge-postgresql-XX-pgaudit | [Configuration and Usage](https://github.com/pgaudit/pgaudit/blob/main/README.md) |
| pgAdmin | pgedge-pgadmin4; pgedge-pgadmin4-desktop; pgedge-pgadmin4-server; pgedge-pgadmin4-web | [Configuration and Usage](https://www.pgadmin.org/docs/) |
| pgBackRest | pgedge-pgbackrest | [Configuration and Usage](https://pgbackrest.org/user-guide-index.html) |
| pgBouncer | pgedge-pgbouncer | [Configuration and Usage](#using-pgbouncer-with-pgedge-enterprise-postgres) |

!!! note

    After using the `pgedge` repository to install a component, use the Postgres [CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html) command to create the extension in your database.

## Using pgBouncer with pgEdge Enterprise Postgres

PgBouncer is a lightweight connection pooler designed to work with Postgres. After configuring the `pgedge` repo, you can install PgBouncer with the command:

`sudo apt-get update`

`sudo apt-get install -y pgedge-pgbouncer` 

After installing pgBouncer, copy the sample `userlist.txt` to the PgBouncer configuration directory:

`sudo cp /usr/share/doc/pgbouncer/userlist.txt /etc/pgbouncer/` 

Next, edit `/etc/pgbouncer/userlist.txt` and add your database user credentials. Entries in the file take the form:

`"postgres" "your_password_here"` 

Next, make sure the file has the correct permissions; use the command:

`sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt sudo chmod 600 /etc/pgbouncer/userlist.txt` 

Before using pgBouncer, you'll need to share system configuration details in the `/etc/pgbouncer/pgbouncer.ini` file; modify the file to match your system. Provide database connection info, listener port, and other options as needed.

Next, ensure that your Postgres server is up and running on the target port and start and enable the PgBouncer service with the command:

`sudo systemctl start pgbouncer && sudo systemctl enable pgbouncer` 

You can use the following command to check the status of the pgBouncer service:

`sudo systemctl status pgbouncer` 

To connect to your Postgres database through PgBouncer connection pooling, use the command:

`psql -p 6432 -U your_username -d pgbouncer` 

Note that `your_username` is a database user included in the `/etc/pgbouncer/userlist.txt` file.