# Upgrading

This page covers how to upgrade the CloudNativePG operator and your PostgreSQL clusters.

## Upgrade Process Overview

Upgrading CloudNativePG involves two steps:

1. **Operator upgrade**: Update the controller deployment to the new version
2. **Instance manager upgrade**: The operator automatically updates the instance manager in each PostgreSQL pod

## Before You Upgrade

!!! warning "Review Release Notes"
    Always review the [CloudNativePG release notes](https://cloudnative-pg.io/docs/1.28/release_notes/) before upgrading. Some versions may have specific requirements or breaking changes.

**Pre-upgrade checklist:**

- [ ] Review release notes for the target version
- [ ] Verify your Kubernetes version is supported (see [Version Support](index.md#version-support-matrix))
- [ ] Ensure all PostgreSQL clusters are healthy
- [ ] Plan for brief application reconnection during primary switchover

## Upgrading the Operator

### Using Helm

Update the Helm repository and upgrade:

```bash
helm repo update pgedge
helm upgrade cnpg pgedge/cloudnative-pg --namespace cnpg-system
```

To upgrade to a specific version:

```bash
helm upgrade cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --version 0.27.0
```

### Using Manifests

Apply the new manifest version:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pgEdge/pgedge-cnpg-dist/main/manifests/cloudnative-pg/v1.28.0/cnpg-1.28.0.yaml
```

## PostgreSQL Cluster Updates

After upgrading the operator, PostgreSQL clusters update their instance manager automatically. The update strategy is controlled by the `primaryUpdateStrategy` setting in your cluster spec.

### Update Strategies

| Strategy | Behavior |
|----------|----------|
| `unsupervised` (default) | Automatic rolling update with switchover |
| `supervised` | Requires manual promotion after replicas update |

With `unsupervised` mode, expect a brief service interruption during the primary switchover. Applications should handle reconnection automatically.

### Controlling Update Spread

For large deployments, spread updates across clusters to reduce resource impact:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `CLUSTERS_ROLLOUT_DELAY` | Delay between cluster rollouts | 0 seconds |
| `INSTANCES_ROLLOUT_DELAY` | Delay between instance updates | 0 seconds |

Configure these in the operator deployment:

```bash
helm upgrade cnpg pgedge/cloudnative-pg \
  --namespace cnpg-system \
  --set env.CLUSTERS_ROLLOUT_DELAY=30 \
  --set env.INSTANCES_ROLLOUT_DELAY=10
```

## Version Compatibility

CloudNativePG follows semantic versioning. All 1.x releases are compatible with each other, but pgEdge recommends upgrading sequentially through each minor version rather than skipping releases.

## Verifying the Upgrade

Check the operator version:

```bash
kubectl get deployment -n cnpg-system cnpg-controller-manager -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Check cluster status:

```bash
kubectl cnpg status my-cluster
```

## Rollback

If issues occur after upgrading, roll back to the previous version:

### Helm Rollback

```bash
helm rollback cnpg --namespace cnpg-system
```

### Manifest Rollback

Apply the previous manifest version:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/pgEdge/pgedge-cnpg-dist/main/manifests/cloudnative-pg/v1.27.1/cnpg-1.27.1.yaml
```

## Resources

- [CloudNativePG Upgrade Docs](https://cloudnative-pg.io/docs/1.28/installation_upgrade/)
- [CloudNativePG Release Notes](https://cloudnative-pg.io/docs/1.28/release_notes/)
