# Troubleshooting

If you're a registered user and need help with pgEdge Enterprise Postgres issues, please visit the website at [support.pgedge.com](https://support.pgedge.com/_hcms/mem/login?redirect_url=https%3A%2F%2Fsupport.pgedge.com%2Fcases).

The pgEdge Discord server is accessible at:  [pgedge.com/contact](https://discord.com/invite/pgedge/login)

## Public key for pgedge-release-latest.noarch.rpm is not installed; Error: GPG check FAILED

When installing Enterprise Postgres packages, you will run into installation issues if your certificate is rejected:

```bash
Downloading Packages:
Public key for pgedge-release-latest.noarch.rpm is not installed
Error: GPG check FAILED
```

To omit the gpgcheck during installation, include the --nogpgcheck flag when installing Postgres:

```bash
dnf install --nogpgcheck -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm
```