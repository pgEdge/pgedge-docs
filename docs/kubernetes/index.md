# pgEdge Enterprise Postgres for Kubernetes

pgEdge provides a supported distribution of the [CloudNativePG](https://cloudnative-pg.io/) operator for running pgEdge Enterprise Postgres on Kubernetes.

This distribution gives you:

- **Helm Charts and Manifests** ready to deploy the CloudNativePG operator
- **kubectl Plugin** for managing PostgreSQL clusters from the command line
- **Validated Compatibility** with pgEdge Enterprise Postgres images through end-to-end testing
- **Commercial Support** from pgEdge for your Kubernetes PostgreSQL deployments

## About CloudNativePG

[CloudNativePG](https://cloudnative-pg.io/) is a [CNCF Sandbox project](https://www.cncf.io/projects/cloudnativepg/) that provides a Kubernetes operator for managing PostgreSQL clusters. It handles provisioning, high availability, backup and recovery, and day-2 operations.

pgEdge distributes CloudNativePG with configurations optimized for pgEdge Enterprise Postgres images, and validates compatibility through automated testing.

!!! note
    This distribution is **not affiliated with, endorsed by, or sponsored by** the CloudNativePG project or the Cloud Native Computing Foundation.

## Getting Started

- [Installation](install.md) - Install the CloudNativePG operator and kubectl plugin
- [Upgrading](upgrade.md) - Upgrade the operator and PostgreSQL clusters

## Version Support Matrix

### CloudNativePG and Kubernetes Versions

| CNPG Version | Kubernetes 1.31 | Kubernetes 1.32 | Kubernetes 1.33 | Kubernetes 1.34 |
|--------------|-----------------|-----------------|-----------------|-----------------|
| 1.28.0 | - | Yes | Yes | Yes |
| 1.27.1 | Yes | Yes | Yes | - |
| 1.27.0 | Yes | Yes | Yes | - |

### PostgreSQL Versions

All CloudNativePG versions support pgEdge Enterprise Postgres versions **16**, **17**, and **18**.

## Testing

pgEdge validates this distribution through automated end-to-end testing against the upstream CloudNativePG test suite.

### What We Test

| Test Category | Description |
|---------------|-------------|
| Infrastructure | Kubernetes cluster provisioning and CSI storage |
| Operator | Operator deployment with pgEdge images |
| Image Validation | Admission control blocks non-pgEdge images |
| Smoke | Quick upstream E2E test subset |
| Comprehensive | Full upstream E2E test suite |

## Support

pgEdge provides support for this distribution as part of pgEdge Enterprise subscriptions. Support includes:

- Installation and configuration assistance
- Troubleshooting operator and cluster issues
- Upgrade guidance between versions
- Integration with pgEdge Enterprise Postgres images

For support inquiries, contact [support@pgedge.com](mailto:support@pgedge.com).

## Resources

- [GitHub Repository](https://github.com/pgEdge/pgedge-cnpg-dist)
- [pgEdge Helm Chart](../pgedge-helm/)
- [pgEdge Enterprise Postgres Images](../container-images/postgres-images.md)
