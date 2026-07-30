# pgEdge Enterprise Postgres for Kubernetes

pgEdge provides a supported distribution of the
[CloudNativePG](https://cloudnative-pg.io/) operator for running pgEdge
Enterprise Postgres on Kubernetes.

This distribution gives you:

- helm charts and manifests ready to deploy the CloudNativePG operator.
- a kubectl plugin for managing PostgreSQL clusters from the command line.
- validated compatibility with pgEdge Enterprise Postgres images through
  end-to-end testing.
- commercial support from pgEdge for your Kubernetes PostgreSQL deployments.

## About CloudNativePG

[CloudNativePG](https://cloudnative-pg.io/) is a
[CNCF Sandbox project](https://www.cncf.io/projects/cloudnativepg/) that
provides a Kubernetes operator for managing PostgreSQL clusters. It handles
provisioning, high availability, backup and recovery, and day-2 operations.

pgEdge distributes CloudNativePG with configurations optimized for pgEdge
Enterprise Postgres images, and validates compatibility through automated
testing.

!!! note

    This distribution is **not affiliated with, endorsed by, or sponsored by**
    the CloudNativePG project or the Cloud Native Computing Foundation.

## Getting Started

- [Installation](install.md) - Install the CloudNativePG operator and kubectl
  plugin
- [Upgrading](upgrade.md) - Upgrade the operator and PostgreSQL clusters
- [CloudNativePG documentation](https://docs.pgedge.com/cloudnativepg/) -
  pgEdge's distribution of the CloudNativePG operator reference docs
- [Barman Cloud plugin documentation](https://docs.pgedge.com/barman-cloud-plugin/) -
  backup and restore for CloudNativePG clusters

## Version Support Matrix

### CloudNativePG and Kubernetes Versions

| CNPG Version | Kubernetes 1.33 | Kubernetes 1.34 | Kubernetes 1.35 | Kubernetes 1.36 |
| ------------ | --------------- | --------------- | --------------- | --------------- |
| 1.30.0       | -               | Yes             | Yes             | Yes             |
| 1.29.1       | Yes             | Yes             | Yes             | -               |

These versions align with the
[CloudNativePG supported releases](https://docs.pgedge.com/cloudnativepg/supported_releases/).
Older minor versions (1.28 and earlier) have reached end of life upstream and
are no longer supported; upgrade to a supported version.

### PostgreSQL Versions

All CloudNativePG versions support pgEdge Enterprise Postgres versions 16, 17,
and 18.

## Testing

pgEdge validates this distribution through automated end-to-end testing against
the upstream CloudNativePG test suite.

## Support

pgEdge provides support for this distribution as part of pgEdge Enterprise
subscriptions. Support includes:

- installation and configuration assistance.
- troubleshooting operator and cluster issues.
- upgrade guidance between versions.
- integration with pgEdge Enterprise Postgres images.

For support inquiries, contact [support@pgedge.com](mailto:support@pgedge.com).

## Resources

- [CloudNativePG documentation](https://docs.pgedge.com/cloudnativepg/)
- [Barman Cloud plugin documentation](https://docs.pgedge.com/barman-cloud-plugin/)
- [GitHub Repository](https://github.com/pgEdge/pgedge-cnpg-dist)
