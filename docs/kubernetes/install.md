# Installation

This page covers how to install the CloudNativePG operator for use with pgEdge
Enterprise Postgres.

## Prerequisites

Before installing, ensure you have:

- A Kubernetes cluster (see [Version Support](index.md#version-support-matrix)
  for supported versions)
- `kubectl` configured to access your cluster
- Cluster admin permissions to install CRDs and operators

## Installation Methods

pgEdge currently distributes the following CloudNativePG operator versions:

| Manifest Version | Helm Chart Version | Upstream Release           |
| ---------------- | ------------------ | -------------------------- |
| v1.30.0          | 0.29.0             | [CloudNativePG v1.30.0][1] |
| v1.29.1          | 0.28.3             | [CloudNativePG v1.29.1][2] |

[1]: https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.30.0
[2]: https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.29.1

You can install CloudNativePG using Helm (recommended), Kubernetes manifests, or
using the GitHub Release artifacts.

### Using Helm (Recommended)

Helm provides the most flexible installation with configurable options.

The following charts are available from the pgEdge Helm repository:

| Chart                        | Description                |
| ---------------------------- | -------------------------- |
| `pgedge/cloudnative-pg`      | CloudNativePG operator     |
| `pgedge/pgedge`              | pgEdge Helm Chart          |
| `pgedge/plugin-barman-cloud` | Barman Cloud backup plugin |

Add the pgEdge Helm chart repository:

```bash
helm repo add pgedge https://pgedge.github.io/charts
helm repo update
```

To install the operator:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace
```

To install a specific version of the operator:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  --version 0.29.0
```

### Using Manifests

For a quick installation without Helm, apply the manifest directly:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pgEdge/pgedge-cnpg-dist/main/manifests/cloudnative-pg/v1.30.0/cnpg-1.30.0.yaml
```

This installs the operator in the `cnpg-system` namespace.

#### Installing from GitHub Releases

Alternatively, download charts directly from
[GitHub Releases](https://github.com/pgEdge/pgedge-cnpg-dist/releases):

```bash
curl -LO https://github.com/pgEdge/pgedge-cnpg-dist/releases/download/cloudnative-pg-v0.29.0/cloudnative-pg-0.29.0.tgz
helm install cnpg cloudnative-pg-0.29.0.tgz \
  --namespace cnpg-system \
  --create-namespace
```

## Verifying the Installation

Check that the operator is running:

```bash
kubectl get deployments -n cnpg-system
```

You should see the controller manager deployment with ready replicas:

```bash
NAME                      READY   UP-TO-DATE   AVAILABLE   AGE
cnpg-controller-manager   1/1     1            1           1m
```

## Installing the Barman Cloud Plugin

The Barman Cloud plugin is an optional add-on that adds backup and restore
capabilities to CloudNativePG clusters via the CNPG-I plugin interface. Install
it alongside the operator when you want cluster backups.

pgEdge currently distributes the following plugin versions:

| Chart Version | App Version    |
| ------------- | -------------- |
| 0.7.0         | [v0.13.0][b1]  |
| 0.6.0         | [v0.12.0][b2]  |

[b1]: https://github.com/cloudnative-pg/plugin-barman-cloud/releases/tag/v0.13.0
[b2]: https://github.com/cloudnative-pg/plugin-barman-cloud/releases/tag/v0.12.0

### Prerequisites

- CloudNativePG operator **1.26 or newer** must already be installed.
- [cert-manager](https://cert-manager.io/) must be installed and ready — the
  plugin uses it to issue TLS certificates.
- The plugin **must** be installed in the same namespace as the CloudNativePG
  operator (typically `cnpg-system`).

### Using Helm

Install the plugin from the pgEdge Helm repository:

```bash
helm install plugin-barman-cloud pgedge/plugin-barman-cloud \
  --namespace cnpg-system
```

To install a specific version:

```bash
helm install plugin-barman-cloud pgedge/plugin-barman-cloud \
  --namespace cnpg-system \
  --version 0.7.0
```

Verify the deployment:

```bash
kubectl rollout status deployment -n cnpg-system plugin-barman-cloud
```

### Using Manifests

Apply the plugin manifest:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pgEdge/pgedge-cnpg-dist/main/manifests/plugin-barman-cloud/v0.13.0/manifest.yaml
```

Verify the deployment:

```bash
kubectl rollout status deployment -n cnpg-system barman-cloud
```

For configuration and cluster wiring, see the pgEdge
[Barman Cloud plugin documentation](https://docs.pgedge.com/barman-cloud-plugin/).

## Installing the kubectl Plugin

The `kubectl-cnpg` plugin extends kubectl with commands for managing
CloudNativePG clusters.

### Using Krew (Recommended)

[Krew](https://krew.sigs.k8s.io/) is the plugin manager for kubectl. Install the
plugin from the pgEdge Krew index:

```bash
# Add the pgEdge Krew index
kubectl krew index add pgedge https://github.com/pgEdge/krew-index.git

# Install the cnpg plugin
kubectl krew install pgedge/cnpg
```

To update the plugin:

```bash
kubectl krew upgrade pgedge/cnpg
```

### Manual Installation

Download pre-built binaries from
[GitHub Releases](https://github.com/pgEdge/pgedge-cnpg-dist/releases?q=kubectl-cnpg&expanded=true)
and follow the instructions attached to the release.

### Basic Usage

```bash
# Check cluster status
kubectl cnpg status my-cluster

# Promote a replica
kubectl cnpg promote my-cluster my-replica

# Create a backup
kubectl cnpg backup my-cluster
```

For complete plugin documentation, see the
[CloudNativePG kubectl Plugin docs](https://docs.pgedge.com/cloudnativepg/kubectl-plugin/).

## High Availability

For production deployments, run multiple operator replicas for high
availability. The operator uses leader election to ensure only one instance is
active at a time.

With Helm:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  --set replicaCount=3
```

## Next Steps

- [Create your first PostgreSQL cluster](https://docs.pgedge.com/cloudnativepg/quickstart/)
- [Configure backups](https://docs.pgedge.com/cloudnativepg/backup/)
- [Set up monitoring](https://docs.pgedge.com/cloudnativepg/monitoring/)

## Resources

- [pgEdge CloudNativePG documentation](https://docs.pgedge.com/cloudnativepg/)
- [pgEdge Barman Cloud plugin documentation](https://docs.pgedge.com/barman-cloud-plugin/)
- [pgEdge Enterprise Postgres for Kubernetes GitHub Repository](https://github.com/pgEdge/pgedge-cnpg-dist)
- [pgEdge Krew Index](https://github.com/pgEdge/krew-index)
- [CloudNativePG Installation Docs](https://docs.pgedge.com/cloudnativepg/installation_upgrade/)
