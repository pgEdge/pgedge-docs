# Migrating into a Distributed Database

The following steps provide a simple way to move an existing PostgreSQL database object to a pgEdge Distributed PostgreSQL (Cloud Edition) database:

1. Create the target database in Cloud.
2. Ensure that the object owner exists in the target database. If necessary, connect to the Cloud database with psql or pgAdmin and [create the owner](https://www.postgresql.org/docs/current/sql-createrole.html) of the object. The following simple syntax creates a PostgreSQL role with login privileges:

    `CREATE ROLE role_name LOGIN PASSWORD 'safe_password'`

3. If the object is in the `public` schema on the source database, log in to the target database and drop the `public` schema. For example:

    `DROP SCHEMA 'public' CASCADE`

4. Run pg_dump against the source database, including the `-Fp` flag to generate a plain-text file that recreates the object being moved with SQL commands. Include the appropriate [pg_dump flags](https://www.postgresql.org/docs/16/app-pgdump.html) to identify the objects that are being included and excluded from the dump file. For example:

    `pg_dump -Fp -h domain_name -U user_name -d database_name -n schema_name > path_to_file/target_filename`

5. Use psql to replay the script into your Cloud database; simply append `< path_to_file/target_filename` to the `PSQL` connection string displayed in your Cloud console and press `Return`.

For more details, see:

* [Taking a Backup](./backup.md)
* [Restoring a Backup](./restore.md)
