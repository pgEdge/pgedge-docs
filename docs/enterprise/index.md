# pgEdge Enterprise Postgres (VM Edition)

pgEdge makes FIPS-enabled packages available via the `pgedge` repository for
Enterprise Linux, Debian, and Ubuntu. Access to the repository requires a
certificate from pgEdge; install the certificate before you install any
packages.

!!! note

    If you installed the `pgedge` repository prior to March 1, 2026, you will
    need to replace and refresh your repository package.  For details, see
    [Updating your Repo for FIPS Support](fips_update.md).

## Obtaining and Installing a Repository Certificate

The certificate provides your host access to the `pgedge` repository. To
request a certificate, submit the request form at:
[pgedge.com/contact](https://www.pgedge.com/contact).

pgEdge will send you two files:

- `client.crt`, the certificate.
- `client.key`, the certificate's private key.

Copy both files to the system you'll use for downloads, then perform the
platform-specific installation steps that follow. Keep `client.key` private;
the commands below make it readable only by the account that downloads
packages.

### Installing the Certificate on Enterprise Linux

On RHEL, Rocky Linux, AlmaLinux, or Oracle Linux, install the files in
`/etc/pki/pgedge`:

```bash
sudo install -d -m 0755 /etc/pki/pgedge
sudo install -m 0644 client.crt /etc/pki/pgedge/client.crt
sudo install -m 0600 client.key /etc/pki/pgedge/client.key
```

### Installing the Certificate on Debian and Ubuntu

On Debian or Ubuntu, install the files in `/etc/pgedge`. `apt` downloads
packages as the `_apt` user, so that user owns the private key:

```bash
sudo install -d -m 0755 /etc/pgedge
sudo install -m 0644 client.crt /etc/pgedge/client.crt
sudo install -o _apt -g root -m 0400 client.key /etc/pgedge/client.key
```

### Understanding Certificate and Access Expiry

Your certificate and your access to the repository expire separately:

- The certificate expiry date is written into `client.crt`. If your access
  continues past that date, pgEdge sends you a new certificate, which you
  install the same way.
- Your access expiry is kept by pgEdge, not in the certificate. pgEdge can
  extend your access without sending you a new certificate, so there is
  nothing for you to install.

Your access can end before your certificate does; for example, a trial
certificate can stay valid after the trial's access period ends. To see when
your certificate expires, run:

```bash
openssl x509 -noout -enddate -in client.crt
```

## Installing pgEdge Enterprise Postgres

When the certificate is in place, use the install builder below to configure
and copy the commands for your platform.

<div id="package-catalog"></div>
<noscript>
  <p>JavaScript is required for the interactive install builder.
  Visit <a href="https://www.pgedge.com/downloads">pgedge.com/downloads</a>
  for manual install instructions.</p>
</noscript>



## Professional Grade Support, 24/7

If your organization needs professional grade support, pgEdge offers support and management subscriptions. You get all of the benefits of pgEdge products, plus:

- 24/7 support by phone, email or ticketing system.
- architecture reviews, performance reviews, and guidance.
- early access to all software updates and new features.
- a dedicated technical account manager (TAM).
- fully licensed for production usage (on a per vCPU basis).

For more information about support for pgEdge Distributed Postgres (VM Edition), [reach out to pgEdge](https://www.pgedge.com/contact).


!!! note

    The platform-specific commands shared in this section work on the majority of the corresponding systems, but may not work on *all* systems.  You may need to find a system-specific command to accomplish the task performed by the commands we've shared.
