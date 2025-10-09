# Best Practices for Managing Database Connections

This section identifies strategies you can use in your applications to connect to pgEdge Distributed Postgres (Cloud Edition) to improve the availability of your application in the following situations:

- Planned maintenance occuring on your Cloud clusters / databases
- Unexpected downtime for a database due to Cloud provider outages or temporary network issues

## Leveraging DNS Failover

Cloud provides the ability to connect to databases using latency-based routing, which automatically routes your application to the nearest Cloud node in your database based on latency. This feature makes it easier for end users to configure their applications to connect to a Cloud database without needing to manually manage connections to individual nodes.

For the following configurations, latency-based routing also factors in the availability of your database:

- Private DNS in Enterprise Edition AWS Clusters where the database has the "Cloudwatch Metrics" option enabled
- Public DNS in Developer Edition

In the event that health checks determine that a database node is unavailable, latency-based routing will automatically route your application to the next nearest node that is available.

## Maintenance Process

Cloud performs maintenance in a rolling manner on all databases (when possible), applying updates to each node individually. As part of this process, health checks for nodes where maintenance will be conducted will be set to fail, and Cloud maintenance processes will wait for a period of three minutes to allow applications to reconnect to other available nodes, and for any existing transactions to complete. Once this waiting period is complete, Cloud systems will perform required upgrades and maintenance before bringing the node back into the pool for latency-based routing, and moving on to subsequent nodes.

## Configuring Connection Timeouts for DNS Renegotiation

When integrating your application, it's important to ensure that connections periodically renegotiate DNS. We recommend setting a connection timeout to 30 seconds to ensure that clients do not hold connections indefinitely and instead re-resolve DNS at regular intervals.  You should also:

- Configure a reasonable connection timeout (typically 30 seconds) to force reconnection and DNS resolution.
- Ensure your application handles reconnections gracefully.
- Use built-in client connection pool settings to enforce timeouts.

### Examples in Popular Frameworks

#### Python (SQLAlchemy)

```python
from sqlalchemy import create_engine

db_url = "postgresql://user:password@db-host/dbname"
engine = create_engine(db_url, pool_recycle=30)  # 30 seconds timeout
```

**Docs:** [SQLAlchemy Connection Pooling](https://docs.sqlalchemy.org/en/20/core/pooling.html)

#### Go (database/sql)

```go
import (
    "database/sql"
    _ "github.com/lib/pq"
)

db, err := sql.Open("postgres", "postgres://user:password@db-host/dbname")
db.SetConnMaxLifetime(30 * time.Second) // 30 seconds timeout
```

**Docs:** [database/sql Connection Settings](https://pkg.go.dev/database/sql)

#### Node.js (pg)

```javascript
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgres://user:password@db-host/dbname",
  idleTimeoutMillis: 30000, // 30 seconds
});
```

**Docs:** [pg Pooling Documentation](https://node-postgres.com/features/pooling)

#### Java (HikariCP)

```java
HikariConfig config = new HikariConfig();
config.setMaximumPoolSize(10);
config.setIdleTimeout(30000); // 30 seconds
config.setMaxLifetime(30000); // Force reconnection every 30 seconds
HikariDataSource ds = new HikariDataSource(config);
```

**Docs:** [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)

### Additional Considerations

- Some frameworks or drivers may cache DNS results internally; ensure they support periodic resolution.
- If you are using Kubernetes, consider setting TTLs on service discovery mechanisms (e.g., CoreDNS) to influence how often DNS queries are re-evaluated.
- In environments with dynamic IP addresses, consider using shorter TTLs at the DNS level.

By correctly configuring connection timeouts, your application can ensure it always connects to the most up-to-date endpoint, reducing downtime and connection failures.

## Configuring Retries

Retries help handle transient failures and improve application resilience when connecting to a database. Configuring retries with exponential backoff ensures that retry attempts do not overwhelm the database. When configuring retries, consider:

- Using exponential backoff to space out retry attempts.
- Limiting the maximum number of retries to avoid excessive delay.
- Adding log retry attempts for debugging and monitoring.
- Adding jitter (randomized wait times between retries) to avoid synchronized retry spikes.

## Specifying Hostnames

In the event that your use case cannot utilize DNS failover, you must configure your application to be resilient to the described maintenance processes. This should be tested and verified prior to moving any application into production.

As an alternative to latency-based routing / DNS failover, you can configure your application with multiple hosts for it to connect to in the event that one host is unavailable. Any libraries or frameworks which are based on libpq should be able to leverage the [multiple hosts specified in a Connection URI](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-MULTIPLE-HOSTS). If your application uses another framework or libary, you may need to implement custom logic to ensure similar logic.

With this approach, you will need to manually manage the order of the hosts which are configured on your application, depending on how it is geographically distributed. You should order the hosts differently on each of your application instances to ensure that your application connects to the nearest node by default.

## Long Running Processes

For scheduled jobs, background workers, or batch tasks, you should take steps to ensure they handle database interruptions gracefully.  You can:

- Retry with backoff: Implement automatic reconnection with exponential backoff.
- Use checkpointing: Periodically save progress to resume after failures.
- Handle connection loss: Detect failures and attempt to reconnect before failing a job.
- Break up long transactions: Where possible, split work into smaller, retryable steps.
- Account for replication lag: If failing over to another node, ensure your job logic can handle potential data inconsistencies or conflicts.

By designing processes with these safeguards, long-running tasks can recover smoothly from database failovers or maintenance events.
