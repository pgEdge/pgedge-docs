# Connecting a Custom Client Application

The `Code Snippets` pane displays three code snippets ([TypeScript](#connecting-with-typescript), [Python](#connecting-with-python), and [Go](#connecting-with-go)) that set the environment variables for your cluster and create a cursor that lists the nodes in your cluster.

![Code Snippets](../images/code_snippets.png)

You can consider the snippets a starting point for the application developers on your team.

## Connecting with Python

The code snippet on the `Python` tab provides parameters and cursor information you can use to negotiate a connection with a Python client. The following code sample demonstrates using that information.

After taking care of prerequisites, the sample uses the connection properties in the code snippet to set environment variables and establish a connection with the database:

```python
import os
import psycopg2
from psycopg2 import sql

# Set the environment variables
os.environ["PGHOST"] = "virtually-pleasing-giraffe-iad.dev.pgedge.cloud"
os.environ["PGUSER"] = "admin"
os.environ["PGDATABASE"] = "testdb"
os.environ["PGSSLMODE"] = "require"
os.environ["PGPASSWORD"] = "**************"

def main():
   # Connect to your PostgreSQL database
   conn = psycopg2.connect(
       host=os.getenv("PGHOST"),
       database=os.getenv("PGDATABASE"),
       user=os.getenv("PGUSER"),
       password=os.getenv("PGPASSWORD"),
       sslmode=os.getenv("PGSSLMODE")
   )
```
Then, we open a cursor that allows us to interact with the database; each call to `cur.execute` invokes a command in PostgreSQL syntax and confirms execution of the command.

```python
   # Open a cursor to perform database operations
   cur = conn.cursor()

   # Create a table
   cur.execute("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL)")
   conn.commit()
   print("Table created")

   # Insert a new user
   cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", ("John Doe", "john@example.com"))
   conn.commit()
   print("User inserted")

   # Return a list of users
   cur.execute("SELECT * FROM users")
   rows = cur.fetchall()
   for row in rows:
       print(row)

   # Update a user
   cur.execute("UPDATE users SET email = %s WHERE id = %s", ("newemail@example.com", 1))
   conn.commit()
   print("User updated")

   # Delete a user
   cur.execute("DELETE FROM users WHERE id = %s", (1,))
   conn.commit()
   print("User deleted")

   # Drop the users table
   cur.execute("DROP TABLE users")
   conn.commit()
   print("Table deleted")
```

When the queries complete, we close the cursor, closing the connection with the database. The last two lines declare the entry point for the Python program: 

```python
   # Close communication with the database
   cur.close()
   conn.close()

if __name__ == "__main__":
   main()
```


## Connecting with TypeScript

The code snippet on the `TypeScript` tab provides parameters and cursor information you can use to negotiate a connection with a TypeScript client. The following code sample demonstrates using that information. 

As a prerequisite, the example uses a `json` file to initialize the TypeScript object:

```json
{
  "name": "node-ts-pgedge",
  "version": "1.0.0",
  "main": "index.ts",
  "license": "MIT",
  "dependencies": {
    "@types/node": "^20.10.6",
    "@types/pg": "^8.10.9",
    "pg": "^8.11.3"
  }
}
```

Then, the example imports the `pg` TypeScript client module before using the connection properties in the code snippet to set environment variables and establish a connection with the database:

```typescript
import { Client } from 'pg';

// Set environment variables
process.env.PGHOST = 'virtually-pleasing-giraffe-iad.dev.pgedge.cloud';
process.env.PGUSER = 'admin';
process.env.PGDATABASE = 'testdb';
process.env.PGSSLMODE = 'require';
process.env.PGPASSWORD = '*****************';

async function main(): Promise<void> {
    // Create a new client instance
    const client = new Client();

    try {
        // Connect to the database
        await client.connect();
```
Then, a series of TypeScript constructs use PostgreSQL syntax to create a table, insert and query user information, and eventually, drop the table:

```typescript
        // Create a new table
        const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `;
        await client.query(createTableQuery);
        console.log('Table created');

        // Create a new user
        const createUserQuery = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
        const createUserValues = ['John Doe', 'john@example.com'];
        const createRes = await client.query(createUserQuery, createUserValues);
        console.log('Created User: ', createRes.rows[0]);

        // Read all users
        const readUsersQuery = 'SELECT * FROM users';
        const readRes = await client.query(readUsersQuery);
        console.log('All Users: ', readRes.rows);

        // Update a user
        const updateUserQuery = 'UPDATE users SET email = $1 WHERE id = $2 RETURNING *';
        const updateUserValues = ['newemail@example.com', createRes.rows[0].id];
        const updateRes = await client.query(updateUserQuery, updateUserValues);
        console.log('Updated User: ', updateRes.rows[0]);

        // Delete a user
        const deleteUserQuery = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const deleteUserValues = [createRes.rows[0].id];
        const deleteRes = await client.query(deleteUserQuery, deleteUserValues);
        console.log('Deleted User: ', deleteRes.rows[0]);

        // Drop the table
        const dropTableQuery = 'DROP TABLE IF EXISTS users';
        await client.query(dropTableQuery);
        console.log('Table dropped');
```
Finally, we check for an error message before closing the connection to the client:

```TypeScript
    } catch (err) {
        console.error(err);
    } finally {
        // Close the connection
        await client.end();
    }
}

// Run the main function
main().catch(console.error);
```

## Connecting with Go

The code snippet on the `Go` tab provides parameters you can use to negotiate a connection with a Go client. The following code sample demonstrates using that information to connect to and query the database.

After importing prerequisites, the sample uses the connection properties in the code snippet to set environment variables and establish a connection with the database:

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v4"
)

func main() {
	// Set the environment variables
	os.Setenv("PGHOST", "virtually-pleasing-giraffe-iad.dev.pgedge.cloud")
	os.Setenv("PGUSER", "admin")
	os.Setenv("PGDATABASE", "testdb")
	os.Setenv("PGSSLMODE", "require")
	os.Setenv("PGPASSWORD", "************")

	ctx := context.Background()

	config, err := pgx.ParseConfig("")
	if err != nil {
		log.Fatalf("Failed to parse configuration: %v", err)
	}
	conn, err := pgx.ConnectConfig(ctx, config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer conn.Close(ctx)
```
After connecting, the example uses the `exec` package to execute PostgreSQL syntax commands that create a table, add a user, update the user, and eventually drop the table.

```go

	// Create a new table
	_, err = conn.Exec(ctx, `CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL,
		email VARCHAR(255) NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
	fmt.Printf("Created table\n")

	// Insert a new user
	res, err := conn.Exec(ctx, "INSERT INTO users (name, email) VALUES ($1, $2)", "John Doe", "john@example.com")
	if err != nil {
		log.Fatalf("Failed to insert user: %v", err)
	}
	fmt.Printf("Inserted %d user\n", res.RowsAffected())

	// Read all users
	rows, err := conn.Query(ctx, "SELECT * FROM users")
	if err != nil {
		log.Fatalf("Failed to read users: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var name string
		var email string
		if err := rows.Scan(&id, &name, &email); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		fmt.Printf("ID: %d, Name: %s, Email: %s\n", id, name, email)
	}

	// Update a user
	res, err = conn.Exec(ctx, "UPDATE users SET email = $1 WHERE id = $2", "newemail@example.com", 1)
	if err != nil {
		log.Fatalf("Failed to update user: %v", err)
	}
	fmt.Printf("Updated %d user\n", res.RowsAffected())

	// Delete a user
	res, err = conn.Exec(ctx, "DELETE FROM users WHERE id = $1", 1)
	if err != nil {
		log.Fatalf("Failed to delete user: %v", err)
	}
	fmt.Printf("Deleted %d user\n", res.RowsAffected())

	// Drop the table
	_, err = conn.Exec(ctx, "DROP TABLE IF EXISTS users")
	if err != nil {
		log.Fatalf("Failed to drop table: %v", err)
	}
	fmt.Printf("Dropped table\n")
}
```