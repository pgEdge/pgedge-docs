# pgEdge Container Registry

pgEdge publishes container images to the GitHub Container Registry 
(GCR) for deploying pgEdge components in containerized environments.
To review the available pgEdge container images, visit the pgEdge
GitHub Container Registry at:

[github.com/orgs/pgEdge/packages](https://github.com/orgs/pgEdge/packages?visibility=public)

All pgEdge container images follow security best practices:

- Images run as unprivileged users for non-root execution.
- Rocky Linux 9 (database images) and Red Hat UBI 9 (AI Toolkit images) serve as enterprise base images.
- Final images contain only runtime dependencies through multi-stage builds.
- pgEdge rebuilds images regularly to include security patches.


## Authentication

You can pull public images without authentication. To avoid rate
limits, authenticate with a GitHub Personal Access Token
(PAT):

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

Your PAT needs the `read:packages` scope to pull images.

## Available Images

Select from the pgEdge images listed below when installing pgEdge Containers.

### Postgres

| Source | Image | Description |
|--------|-------|-------------|
| [pgEdge/postgres-images](https://github.com/pgEdge/postgres-images) | `ghcr.io/pgedge/pgedge-postgres` | pgEdge Enterprise PostgreSQL with extensions pre-installed |

### Control Plane

| Source | Image | Description |
|--------|-------|-------------|
| [pgEdge/control-plane](https://github.com/pgEdge/control-plane) | `ghcr.io/pgedge/control-plane` | Orchestration and management control plane |

### Kubernetes

| Source | Image | Description |
|--------|-------|-------------|
| - | `ghcr.io/pgedge/cloudnative-pg` | CloudNativePG operator for Kubernetes deployments |
| [pgEdge/pgedge-helm](https://github.com/pgEdge/pgedge-helm) | `ghcr.io/pgedge/pgedge-helm-utils` | Utility image for Helm chart operations |

### AI Toolkit

| Source | Image | Description |
|--------|-------|-------------|
| [pgEdge/pgedge-postgres-mcp](https://github.com/pgEdge/pgedge-postgres-mcp) | `ghcr.io/pgedge/postgres-mcp` | MCP server with PostgreSQL tools for AI agents |
| [pgEdge/pgedge-postgres-mcp](https://github.com/pgEdge/pgedge-postgres-mcp) | `ghcr.io/pgedge/nla-web` | Natural Language Agent web UI |
| [pgEdge/pgedge-postgres-mcp](https://github.com/pgEdge/pgedge-postgres-mcp) | `ghcr.io/pgedge/nla-cli` | Natural Language Agent command-line client |
| [pgEdge/pgedge-rag-server](https://github.com/pgEdge/pgedge-rag-server) | `ghcr.io/pgedge/rag-server` | RAG (Retrieval-Augmented Generation) server |

### Tools

| Source | Image | Description |
|--------|-------|-------------|
| [pgEdge/ace](https://github.com/pgEdge/ace) | `ghcr.io/pgedge/ace` | Active Consistency Engine for distributed PostgreSQL |