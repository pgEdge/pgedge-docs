# Troubleshooting

If you're a registered user and need help with pgEdge Enterprise Postgres issues, please visit the website at [support.pgedge.com](https://support.pgedge.com/_hcms/mem/login?redirect_url=https%3A%2F%2Fsupport.pgedge.com%2Fcases).

The pgEdge Discord server is accessible at:  [pgedge.com/contact](https://discord.com/invite/pgedge/login)

## Public key for pgedge-release-latest.noarch.rpm is not installed; Error: GPG check FAILED

!!! note

    This issue was reported on OEL 10.

When installing Enterprise Postgres packages, you will run into installation issues if your certificate is rejected:

```bash
Downloading Packages:
Public key for pgedge-release-latest.noarch.rpm is not installed
Error: GPG check FAILED
```

To omit the gpgcheck during installation, include the --nogpgcheck flag when installing Postgres:

```bash
dnf install --nogpgcheck -y https://downloads.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm
```

## Failed to download metadata for repo 'pgedge'

When your repository certificate is suspended or has expired, `dnf` cannot
download the `pgedge` repository's metadata, and reports an HTTP/2 stream
error similar to the following:

```bash
pgEdge RPM Repository    0.0  B/s |   0  B     01:31
Errors during downloading metadata for repository 'pgedge':
  - Curl error (92): Stream error in the HTTP/2 framing layer for https://.../repodata/repomd.xml [HTTP/2 stream 1 was not closed cleanly before end of the underlying stream]
Error: Failed to download metadata for repo 'pgedge': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried
```

To check your certificate's expiration date, use the command:

```bash
sudo pgedge-subscription-manager status
```

If your certificate has expired and your access continues, install the new
certificate that pgEdge sends you, adding `--force` to replace the current
certificate:

```bash
sudo pgedge-subscription-manager install --force complete_path_to/client.crt
```

If your certificate is suspended or your access has ended, reach out to
[pgEdge support](mailto:support@pgedge.com). For more information, see
[Understanding Certificate and Access Expiration](index.md#understanding-certificate-and-access-expiration).
