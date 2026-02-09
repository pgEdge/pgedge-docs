# Installation

This page covers how to install the CloudNativePG operator for use with pgEdge Enterprise Postgres.

## Prerequisites

Before installing, ensure you have:

- A Kubernetes cluster (see [Version Support](index.md#version-support-matrix) for supported versions)
- `kubectl` configured to access your cluster
- Cluster admin permissions to install CRDs and operators

## Installation Methods

### Using Helm (Recommended)

Helm provides the most flexible installation with configurable options.

Add the pgEdge Helm chart repository:

```bash
helm repo add pgedge https://pgedge.github.io/charts
helm repo update
```

Install the operator:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace
```

To install a specific version:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  --version 0.27.0
```

#### Available Charts

| Chart | Description |
|-------|-------------|
| `pgedge/cloudnative-pg` | CloudNativePG operator |
| `pgedge/plugin-barman-cloud` | Barman Cloud backup plugin |

#### Installing from GitHub Releases

Alternatively, download charts directly from [GitHub Releases](https://github.com/pgEdge/pgedge-cnpg-dist/releases):

```bash
curl -LO https://github.com/pgEdge/pgedge-cnpg-dist/releases/latest/download/cloudnative-pg-0.27.0.tgz
helm install cnpg cloudnative-pg-0.27.0.tgz \
  --namespace cnpg-system \
  --create-namespace
```

### Using Manifests

For a quick installation without Helm, apply the manifest directly:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pgEdge/pgedge-cnpg-dist/main/manifests/cloudnative-pg/v1.28.0/cnpg-1.28.0.yaml
```

This installs the operator in the `cnpg-system` namespace.

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

## Available Versions

| Manifest Version | Helm Chart Version | Upstream Release |
|------------------|-------------------|------------------|
| v1.28.0 | 0.27.0 | [CloudNativePG v1.28.0](https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.28.0) |
| v1.27.1 | 0.26.1 | [CloudNativePG v1.27.1](https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.27.1) |
| v1.27.0 | 0.26.0 | [CloudNativePG v1.27.0](https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.27.0) |

## Installing the kubectl Plugin

The `kubectl-cnpg` plugin extends kubectl with commands for managing CloudNativePG clusters.

### Using Krew (Recommended)

[Krew](https://krew.sigs.k8s.io/) is the plugin manager for kubectl. Install the plugin from the pgEdge Krew index:

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

Download pre-built binaries from [GitHub Releases](https://github.com/pgEdge/pgedge-cnpg-dist/releases?q=kubectl-cnpg&expanded=true) and follow the instructions attached to the release.

### Basic Usage

```bash
# Check cluster status
kubectl cnpg status my-cluster

# Promote a replica
kubectl cnpg promote my-cluster my-replica

# Create a backup
kubectl cnpg backup my-cluster
```

For complete plugin documentation, see the [CloudNativePG kubectl Plugin docs](https://cloudnative-pg.io/documentation/current/kubectl-plugin/).

## High Availability

For production deployments, run multiple operator replicas for high availability. The operator uses leader election to ensure only one instance is active at a time.

With Helm:

```bash
helm install cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  --set replicaCount=3
```

## Next Steps

- [Create your first PostgreSQL cluster](https://cloudnative-pg.io/docs/1.28/quickstart/)
- [Configure backups](https://cloudnative-pg.io/docs/1.28/backup/)
- [Set up monitoring](https://cloudnative-pg.io/docs/1.28/monitoring/)

## Resources

- [pgEdge Helm Chart Repository](https://pgedge.github.io/charts)
- [pgEdge Krew Index](https://github.com/pgEdge/krew-index)
- [pgEdge CNPG Distribution on GitHub](https://github.com/pgEdge/pgedge-cnpg-dist)
- [CloudNativePG Installation Docs](https://cloudnative-pg.io/docs/1.28/installation_upgrade/)
