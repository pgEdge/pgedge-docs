# Connecting over HTTPS

API functionality that allows you to securely query your database from any HTTP client is available via an embedded [pREST](https://github.com/prest/prest) server that runs alongside the database.

To enable this feature, move the `Enable REST API` toggle switch to `On` when you create your database.

## Why HTTPS?

Postgres is a fantastic database choice for almost any application, including many where there are limitations or restrictions on the compute and networking resources available. The HTTPS API supports querying from clients where raw TCP connections are not possible or where a PostgreSQL client library is unavailable (most notably, some edge compute and serverless platforms are in this situation).

## Authentication (AuthN) and Authorization (AuthZ)

Connecting and querying over HTTPS builds on the same `authn` and `authz` mechanisms as standard PostgreSQL connections. This means that the same database roles and passwords are used when querying over HTTPS.

Currently, the HTTPS API only allows querying using the built-in `app` user. We recommend using the built-in `admin` user, or a separate administrative user that you create, to run migrations over a standard PostgreSQL TCP connection. Then, with the database schema in place, use the `app` user to query over HTTPS. As a result, all queries will be subject to the permissions assigned to the `app` user, which you can customize as needed.

You can pass credentials via standard basic authentication headers. Support for additional authentication methods such as JWTs is planned. See below for specific authentication examples.

## Database URLs

Each Cloud database has a unique URL that is used when connecting from any client, whether it be over a standard PostgreSQL connection or over HTTPS. You can copy the URL from the Database Details page in the pgEdge Cloud to use with your client.

For example, to connect to a database with a URL of `random-name.a1.pgedge.io`:

Using PSQL:

```bash
PGPASSWORD=MYSECRETPASSWORD psql -U app -h random-name.a1.pgedge.io -d defaultdb
```

Using an HTTP client:

```bash
curl -u app:MYSECRETPASSWORD https://random-name.a1.pgedge.io/defaultdb/public
```

## API Endpoints

The HTTPS API supports the following endpoints:

- `GET /show/:database/:schema/:table`: Lists table structure.
- `GET /:database/:schema`: Lists tables in a schema.
- `GET /:database/:schema/:table`: Queries rows in a table.
- `POST /:database/:schema/:table`: Insert a row into a table.
- `PUT /:database/:schema/:table?{field}={value}`: Update matching row(s) in a table.
- `PATCH /:database/:schema/:table?{field}={value}`: Update matching row(s) in a table.
- `DELETE /:database/:schema/:table?{field}={value}`: Delete matching row(s) from a table.

For example, to query a `public.users` table in the `defaultdb` database, the request would look like this:

```bash
GET https://random-name.a1.pgedge.io/defaultdb/public/users
```

## Query Parameters

You can use query parameters to filter, paginate, and sort results.

| Query String                | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `{field}={value}`           | Filter by a field name. Can be repeated.                    |
| `_page={number}`            | Paginate results.                                           |
| `_page_size={number}`       | Set the number of results per page.                         |
| `_select={field1},{field2}` | Select specific fields.                                     |
| `_count={field}`            | Count per field. Can provide `*`.                           |
| `_count_first=true`         | Return count results as non-list.                           |
| `_distinct=true`            | Return distinct results.                                    |
| `_order={field1},{field2}`  | Order by a field. Prefix the field with `-` for DESC order. |
| `_groupby={field}`          | Group by a field.                                           |

For more information about supported query parameters, see the [pREST documentation](https://docs.prestd.com/api-reference/parameters).

## SQL Functions

You can use functions to aggregate and group results.

| Name       | Use in Request   |
| ---------- | ---------------- |
| `SUM`      | `sum:field`      |
| `AVG`      | `avg:field`      |
| `MAX`      | `max:field`      |
| `MIN`      | `min:field`      |
| `STDDEV`   | `stddev:field`   |
| `VARIANCE` | `variance:field` |

## Operators

You can use operators to customize result filtering.

| Name             | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `$eq`            | Matches values exactly equal to the specified value.                   |
| `$gt`            | Matches values greater than the specified value.                       |
| `$gte`           | Matches values greater than or equal to the specified value.           |
| `$lt`            | Matches values less than the specified value.                          |
| `$lte`           | Matches values less than or equal to the specified value.              |
| `$ne`            | Matches values not equal to the specified value.                       |
| `$in`            | Matches any values listed in the specified array.                      |
| `$nin`           | Excludes values listed in the specified array.                         |
| `$null`          | Matches fields that are null.                                          |
| `$notnull`       | Matches fields that are not null.                                      |
| `$true`          | Matches fields that are true.                                          |
| `$nottrue`       | Matches fields that are not true (includes false and null).            |
| `$false`         | Matches fields that are false.                                         |
| `$notfalse`      | Matches fields that are not false (includes true and null).            |
| `$like`          | Matches strings fully containing the specified pattern.                |
| `$ilike`         | Case-insensitively matches strings containing the specified pattern.   |
| `$nlike`         | Excludes strings fully containing the specified pattern.               |
| `$nilike`        | Case-insensitively excludes strings containing the specified pattern.  |
| `$ltreelanc`     | Matches if the left argument is an ancestor or the same as the right.  |
| `$ltreerdesc`    | Matches if the left argument is a descendant or the same as the right. |
| `$ltreematch`    | Matches ltree paths that meet the specified lquery conditions.         |
| `$ltreematchtxt` | Matches ltree paths against the specified textual query conditions.    |

## Example Requests

These examples assume the Northwind Traders dataset is loaded onto a database `defaultdb` with the URL:

```bash
https://random-name.a1.pgedge.io
```

### Query a Table

Use the following command to query the first three rows of the `categories` table:

```bash
curl -u app:MYSECRETPASSWORD \
    "https://random-name.a1.pgedge.io/defaultdb/public/categories?_page=1&_page_size=3"
```

```json
[
  {
    "picture": "\\x",
    "category_id": 1,
    "description": "Soft drinks, coffees, teas, beers, and ales",
    "category_name": "Beverages"
  },
  {
    "picture": "\\x",
    "category_id": 2,
    "description": "Sweet and savory sauces, relishes, spreads, and seasonings",
    "category_name": "Condiments"
  },
  {
    "picture": "\\x",
    "category_id": 3,
    "description": "Desserts, candies, and sweet breads",
    "category_name": "Confections"
  }
]
```

### Count Rows

Use the following commands to count the number of rows in the `categories` table:

```bash
curl -u app:MYSECRETPASSWORD \
    "https://random-name.a1.pgedge.io/defaultdb/public/categories?_count=category_id&_count_first=true"
```

```json
{
  "count": 8
}
```

### Insert a Row

Use the following commands to insert a new row into the `categories` table:

```bash
curl -u app:MYSECRETPASSWORD \
    -X POST \
    "https://random-name.a1.pgedge.io/defaultdb/public/categories" \
    -d '{"category_id": 9, "category_name": "New Category"}'
```

```json
{
  "category_id": 9,
  "category_name": "New Category",
  "description": null,
  "picture": null
}
```

### Update a Row

Use the following command to update the row with `category_id` equal to 1:

```bash
curl -u app:MYSECRETPASSWORD \
    -X PATCH \
    "https://random-name.a1.pgedge.io/defaultdb/public/categories?category_id=1" \
    -d '{"category_name": "New Beverages"}'
```

```json
{
  "rows_affected": 1
}
```

### Delete a Row

Use the following commands to delete the row with `category_id` equal to 1:

```bash
curl -u app:MYSECRETPASSWORD \
    -X DELETE \
    "https://random-name.a1.pgedge.io/defaultdb/public/categories?category_id=1"
```

```json
{
  "rows_affected": 1
}
```

### Group By

The following query counts the number of `products` in each category:

```bash
curl -u app:MYSECRETPASSWORD \
    "https://random-name.a1.pgedge.io/defaultdb/public/products?_select=category_id&_count=product_id&_groupby=category_id"
```

```json
[
  {
    "category_id": 1,
    "count": 12
  },
  {
    "category_id": 2,
    "count": 12
  },
  {
    "category_id": 3,
    "count": 13
  },
  {
    "category_id": 4,
    "count": 10
  },
  {
    "category_id": 5,
    "count": 7
  },
  {
    "category_id": 6,
    "count": 6
  },
  {
    "category_id": 7,
    "count": 5
  },
  {
    "category_id": 8,
    "count": 12
  }
]
```

### Show Columns

Use the following commands to display the columns in the `categories` table:

```bash
curl -u app:MYSECRETPASSWORD \
    "https://random-name.a1.pgedge.io/show/defaultdb/public/categories"
```

Output:

```json
[
  {
    "position": 1,
    "data_type": "smallint",
    "max_length": 16,
    "table_name": "categories",
    "column_name": "category_id",
    "is_nullable": "NO",
    "is_generated": "NEVER",
    "is_updatable": "YES",
    "table_schema": "public",
    "default_value": null
  },
  {
    "position": 2,
    "data_type": "character varying",
    "max_length": 15,
    "table_name": "categories",
    "column_name": "category_name",
    "is_nullable": "NO",
    "is_generated": "NEVER",
    "is_updatable": "YES",
    "table_schema": "public",
    "default_value": null
  },
  {
    "position": 3,
    "data_type": "text",
    "max_length": null,
    "table_name": "categories",
    "column_name": "description",
    "is_nullable": "YES",
    "is_generated": "NEVER",
    "is_updatable": "YES",
    "table_schema": "public",
    "default_value": null
  },
  {
    "position": 4,
    "data_type": "bytea",
    "max_length": null,
    "table_name": "categories",
    "column_name": "picture",
    "is_nullable": "YES",
    "is_generated": "NEVER",
    "is_updatable": "YES",
    "table_schema": "public",
    "default_value": null
  }
]
```

## More Information

You can find more information about the pREST API in its [documentation](https://docs.prestd.com/api-reference).
