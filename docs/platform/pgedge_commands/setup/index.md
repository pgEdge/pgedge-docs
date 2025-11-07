# The setup Command

You can [use the setup command](../../installing_pgedge/manual.md) to deploy a pgEdge Distributed Postgres cluster.

SYNOPSIS
    ./pgedge setup <flags>

DESCRIPTION
    Install a node (including Postgres, Spock, and Snowflake sequences)

Example: ./pgedge setup -U user -P passwd -d test --pg_ver 16

FLAGS
    -U, --User=USER
        The database user that will own the db (required)
    
    -P, --Passwd=PASSWD
        The password for the newly created db user (required)
    
    -d, --dbName=DBNAME
        The database name (required)
    
    --port=PORT
        Defaults to 5432 if not specified
    
    --pg_data=PG_DATA
        The data directory to use for Postgres. Must be an absolute path. Defaults to `data/pgV`, relative to where the CLI is installed

    --pg_ver=PG_VER
        Defaults to latest prod version of pg, such as 16.  May be pinned to a specific pg version such as 16.1
    
    -s, --spock_ver=SPOCK_VER
        Defaults to latest prod version of Spock, such as 5.0.  May be pinned to a specific spock version such as 5.0.
    
    -a, --autostart=AUTOSTART
        Defaults to `False`
