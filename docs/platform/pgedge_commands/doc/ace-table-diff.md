# `pgedge ace table-diff`

```text

SYNOPSIS
    ./pgedge ace table-diff CLUSTER_NAME TABLE_NAME <flags>

DESCRIPTION
    Performs a table diff operation on a specified cluster and table.

POSITIONAL ARGUMENTS
    CLUSTER_NAME
        Name of the cluster to perform the diff on.
    TABLE_NAME
        Name of the table to diff.

FLAGS
    -d, --dbname=DBNAME
        Name of the database. Defaults to None.
    
    --block_rows=BLOCK_ROWS
        Number of rows per block. Defaults to config.BLOCK_ROWS_DEFAULT.
    
    -m, --max_cpu_ratio=MAX_CPU_RATIO
        Maximum CPU usage ratio. Defaults to config.MAX_CPU_RATIO_DEFAULT.
    
    -o, --output=OUTPUT
        Output format. Defaults to "json".
    
    -n, --nodes=NODES
        Nodes to include in the diff. Defaults to "all".
    
    --batch_size=BATCH_SIZE
        Size of each batch. Defaults to config.BATCH_SIZE_DEFAULT.
    
    -t, --table_filter=TABLE_FILTER
    
    
    -q, --quiet=QUIET
        Whether to suppress output. Defaults to False.
    

```
