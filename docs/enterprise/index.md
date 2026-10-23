# pgEdge Enterprise Postgres Repository

pgEdge makes FIPS-enabled packages available via the `pgedge` repository for
Enterprise Linux, Debian, and Ubuntu. Access to the repository requires a
certificate from pgEdge; install the certificate after you add the repository
and before you install any packages.

!!! note

    If you installed the `pgedge` repository prior to March 1, 2026, you will
    need to replace and refresh your repository package.  For details, see
    [Updating your Repo for FIPS Support](fips_update.md).

## Obtaining and Installing a Repository Certificate

The certificate provides your host access to the `pgedge` repository. The
`pgedge-subscription-manager` tool, which the repository package installs,
creates the host's private key and certificate signing request, and installs
the certificate that pgEdge returns. The private key stays on your host; you
send pgEdge only the certificate signing request.

The following steps are the same on Enterprise Linux, Debian, and Ubuntu:

1. Add the `pgedge` repository to the host, as described in Configuring the
   Repository for [Enterprise Linux](el/configure-repo.md) or for
   [Debian and Ubuntu](debian/configure-repo.md).

2. Register the host. The following command creates the host's private key
   and a certificate signing request in the `client.csr` file:

    ```bash
    sudo pgedge-subscription-manager register-system
    ```

3. Email the `client.csr` file to pgEdge support at `support@pgedge.com`.
   pgEdge returns your certificate, `client.crt`, by email.

4. Copy `client.crt` to the host, then install the certificate. Run the
   following command in the directory that contains `client.crt`:

    ```bash
    sudo pgedge-subscription-manager install client.crt
    ```

### Understanding Certificate and Access Expiry

Your certificate and your access to the repository expire separately:

- The certificate expiry date is written into `client.crt`. If your access
  continues past that date, pgEdge sends you a new certificate, which you
  install the same way.
- Your access expiry is kept by pgEdge, not in the certificate. pgEdge can
  extend your access without sending you a new certificate, so there is
  nothing for you to install.

Your access can end before your certificate does; for example, the
certificate for a 30-day evaluation can stay valid after the evaluation's
access period ends. To see when your certificate expires, run:

```bash
openssl x509 -noout -enddate -in client.crt
```

## Installing pgEdge Enterprise Postgres

Use the install builder below to configure and copy the commands for your
platform. The builder's commands add the repository, register the host and
install its certificate, and then install and start Postgres.

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

For more information about support for the pgEdge Enterprise Postgres Repository, [reach out to pgEdge](https://www.pgedge.com/contact).


!!! note

    The platform-specific commands shared in this section work on the majority of the corresponding systems, but may not work on *all* systems.  You may need to find a system-specific command to accomplish the task performed by the commands we've shared.
