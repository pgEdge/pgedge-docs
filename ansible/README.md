# pgEdge RAG Server - Ansible Deployment

This directory contains Ansible playbooks and roles for deploying the pgEdge RAG server infrastructure.

## Overview

The deployment consists of:

1. **EC2 Instance** - AWS EC2 instance running Debian Trixie
2. **PostgreSQL** - Database with pgvector extension for vector storage
3. **RAG Server** - pgEdge RAG server for documentation Q&A
4. **Cloudflared** - Cloudflare Tunnel for secure connectivity
5. **Cloudflare Worker** - API proxy for the documentation site

## Prerequisites

### Local Machine

```bash
# Install Ansible
pip install ansible

# Install required collections
ansible-galaxy collection install amazon.aws community.postgresql

# Install boto3 for AWS operations
pip install boto3 botocore
```

### AWS

- AWS credentials configured (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- SSH key pair created in your target region (see below)
- Appropriate IAM permissions for EC2, VPC, and Security Groups

#### Creating an SSH Key Pair

Create a new key pair in AWS and save the private key locally:

```bash
# Create key pair and save private key
aws ec2 create-key-pair --region us-east-1 --key-name pgedge-rag \
  --query 'KeyMaterial' --output text > ~/.ssh/pgedge-rag.pem

# Set correct permissions
chmod 400 ~/.ssh/pgedge-rag.pem
```

Alternatively, import an existing public key:

```bash
# Import existing key
aws ec2 import-key-pair --region us-east-1 --key-name pgedge-rag \
  --public-key-material fileb://~/.ssh/id_rsa.pub
```

### Cloudflare (Optional)

- Cloudflare account with the target domain
- API token with Workers and DNS permissions
- Account ID (found in Cloudflare dashboard)

## Quick Start

### 1. Configure Variables

Edit `inventory/group_vars/all.yml` with your settings:

```yaml
ec2:
  region: us-east-1
  ami_id: ami-xxxxxxxxx  # Debian Trixie AMI
  key_name: your-key-name
  instance_type: t3.medium

postgresql:
  database:
    password: your-secure-password

api_keys:
  openai: sk-xxxxxxxx
  anthropic: sk-ant-xxxxxxxx
```

### 2. Create Ansible Vault for Secrets

```bash
# Create vault file
ansible-vault create inventory/group_vars/vault.yml
```

Add your secrets:

```yaml
vault_postgres_password: your-secure-password
vault_openai_api_key: sk-xxxxxxxx
vault_anthropic_api_key: sk-ant-xxxxxxxx
vault_cloudflare_api_token: your-cf-token
vault_cloudflare_account_id: your-account-id
vault_rag_secret: shared-secret-for-worker
```

### 3. Create Vault Password File

Create a password file so you don't need to enter the vault password each time:

```bash
# Create the password file (replace with your actual vault password)
echo "your-vault-password" > .pgedge-docs-vault-pass
chmod 600 .pgedge-docs-vault-pass
```

This file is already in `.gitignore` and will not be committed.

### 4. Deploy EC2 Instance

```bash
ansible-playbook playbooks/deploy_ec2.yml
```

### 5. Update Inventory

Add the new instance to `inventory/hosts.yml`:

```yaml
all:
  children:
    rag_servers:
      hosts:
        rag1:
          ansible_host: <ec2-public-ip>
          ansible_user: admin
          ansible_ssh_private_key_file: ~/.ssh/your-key.pem
```

### 6. Deploy RAG Server Stack

```bash
# Full deployment (vault password is read from .pgedge-docs-vault-pass)
ansible-playbook playbooks/site.yml

# Or deploy specific components
ansible-playbook playbooks/site.yml --tags postgresql
ansible-playbook playbooks/site.yml --tags rag_server
ansible-playbook playbooks/site.yml --tags cloudflared
ansible-playbook playbooks/site.yml --tags cloudflare_worker
```

## Directory Structure

```
ansible/
├── ansible.cfg              # Ansible configuration
├── inventory/
│   ├── hosts.yml            # Inventory file
│   └── group_vars/
│       ├── all.yml          # Main variables
│       └── vault.yml        # Encrypted secrets (create this)
├── playbooks/
│   ├── site.yml             # Main playbook
│   └── deploy_ec2.yml       # EC2 deployment playbook
└── roles/
    ├── ec2_deploy/          # EC2 instance provisioning
    ├── postgresql/          # PostgreSQL + pgvector setup
    ├── rag_server/          # RAG server installation
    ├── cloudflared/         # Cloudflare Tunnel setup
    └── cloudflare_worker/   # Cloudflare Worker deployment
```

## Roles

### ec2_deploy

Provisions an EC2 instance with:
- Configurable instance type, region, and availability zone
- Custom root volume size and type (gp3)
- Security group with SSH access
- Tagging for resource management

### postgresql

Installs and configures:
- PostgreSQL from pgEdge Enterprise repositories
- pgvector extension for vector similarity search
- pgedge-vectorizer for automatic embedding generation
- Database schema with `public.docs` table
- Database user for the RAG server
- Optimized settings for vector workloads

**Database Schema:**

The `public.docs` table stores documentation content:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `product` | VARCHAR(100) | Product name (pgedge, spock, ace, etc.) |
| `version` | VARCHAR(50) | Version string (5.0, 4.0.1, etc.) |
| `source_url` | TEXT | Original documentation URL |
| `source_path` | TEXT | File path in documentation repo |
| `title` | TEXT | Page/section title |
| `content` | TEXT | Documentation text content |
| `chunk_index` | INTEGER | Index of chunk within source document |
| `chunk_type` | VARCHAR(50) | Type: title, content, code, etc. |
| `embedding` | vector | Auto-generated by pgedge-vectorizer |

**Loading Documentation:**

After deployment, load your documentation into the table:

```sql
INSERT INTO public.docs (product, version, source_url, title, content, chunk_type)
VALUES ('pgedge', '5.0', 'https://docs.pgedge.com/...', 'Installation', 'Content here...', 'content');
```

The vectorizer will automatically generate embeddings for new rows.

### rag_server

Deploys the RAG server:
- Creates dedicated system user
- Deploys configuration from template
- Manages API keys securely
- Configures systemd service
- Health check verification

### cloudflared

Sets up Cloudflare Tunnel:
- Downloads and installs cloudflared
- Configures tunnel for RAG server access
- Installs as systemd service
- Provides manual setup instructions if credentials missing

### cloudflare_worker

Deploys the API proxy worker:
- Creates worker script from template
- Uploads to Cloudflare via API
- Configures route for docs domain
- Sets up RAG_SECRET environment variable

## Configuration Reference

### EC2 Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ec2.region` | AWS region | `us-east-1` |
| `ec2.availability_zone` | Availability zone | `us-east-1a` |
| `ec2.ami_id` | Debian Trixie AMI ID | Required |
| `ec2.instance_type` | Instance type | `t3.medium` |
| `ec2.key_name` | SSH key pair name | Required |
| `ec2.root_volume.size_gb` | Root volume size | `50` |

### PostgreSQL Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `postgresql.version` | PostgreSQL version | `18` |
| `postgresql.database.name` | Database name | `docloader` |
| `postgresql.database.user` | Database user | `ragserver` |
| `postgresql.vectorizer.enabled` | Enable automatic embeddings | `true` |
| `postgresql.vectorizer.provider` | Embedding provider | `openai` |
| `postgresql.vectorizer.chunk_size` | Token chunk size | `400` |

### RAG Server Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `rag_server.listen_address` | Bind address | `127.0.0.1` |
| `rag_server.port` | Listen port | `8080` |
| `rag_server.pipeline.name` | Pipeline name | `pgedge-docs` |

### Cloudflare Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `cloudflared.tunnel_name` | Tunnel name | `pgedge-rag` |
| `cloudflared.internal_hostname` | Internal hostname | Required |
| `cloudflare_worker.worker_name` | Worker name | `pgedge-chat-proxy` |
| `cloudflare_worker.route_pattern` | Route pattern | Required |

## Manual Cloudflare Tunnel Setup

If you prefer to set up the tunnel manually:

```bash
# SSH to the server
ssh admin@<ec2-ip>

# Login to Cloudflare (opens browser)
sudo cloudflared tunnel login

# Create tunnel
sudo cloudflared tunnel create pgedge-rag

# Note the tunnel ID and copy credentials
sudo cp ~/.cloudflared/<tunnel-id>.json /etc/cloudflared/credentials.json

# Configure DNS in Cloudflare dashboard
# Add CNAME: rag-internal.yourdomain.com -> <tunnel-id>.cfargotunnel.com

# Re-run Ansible to complete setup
ansible-playbook playbooks/site.yml --tags cloudflared
```

## Troubleshooting

### EC2 Deployment Fails

- Verify AWS credentials: `aws sts get-caller-identity`
- Check AMI ID is valid for your region
- Ensure key pair exists: `aws ec2 describe-key-pairs`

### PostgreSQL Connection Issues

- Check service status: `sudo systemctl status postgresql`
- Verify pg_hba.conf allows connections
- Test connection: `psql -h localhost -U ragserver -d docloader`

### RAG Server Not Starting

- Check logs: `sudo journalctl -u pgedge-rag-server -f`
- Verify config: `sudo cat /etc/pgedge/rag-server/config.yaml`
- Check API keys are present: `sudo ls -la /etc/pgedge/keys/`

### Cloudflared Issues

- Check tunnel status: `cloudflared tunnel info pgedge-rag`
- Verify credentials: `sudo cat /etc/cloudflared/credentials.json`
- Check service: `sudo systemctl status cloudflared`

## Security Notes

1. **API Keys**: Store in Ansible Vault, never in plain text
2. **RAG Server**: Binds to localhost only; tunnel provides access
3. **Security Group**: Only SSH (22) is open; RAG traffic goes through tunnel
4. **Worker Secret**: Validates requests to prevent unauthorized access
5. **CORS**: Worker restricts to specific origin domain
