# pgEdge Enterprise Postgres Repository

pgEdge makes FIPS-enabled packages available via the `pgedge` repository for
Enterprise Linux, Debian, and Ubuntu. Access to the repository requires an
active pgEdge subscription and a certificate from pgEdge; install the
certificate after you add the repository, and before you install any packages.

!!! note

    If you installed the `pgedge` repository prior to March 1, 2026, you will
    need to replace and refresh your repository package.  For details, see
    [Updating your Repo for FIPS Support](fips_update.md).

## Obtaining and Installing a Repository Certificate

A repository certificate from pgEdge provides your host access to the `pgedge`
repository. To
[request a certificate](https://www.postgresql.org/docs/current/ssl-tcp.html#SSL-CERTIFICATE-CREATION),
you must first generate a key pair on the host itself. A key pair consists of
a private key and its matching public key; the private key stays on your host,
and you send pgEdge the public key in a certificate signing request
(`client.csr`).

Each host that downloads packages from the repository needs its own
certificate, so run the following steps once on every host. The steps are the
same on Enterprise Linux, Debian, and Ubuntu:

1. Add the `pgedge` repository to the host, as described in Configuring the
   Repository for [Enterprise Linux](el/configure-repo.md) or for
   [Debian and Ubuntu](debian/configure-repo.md).

2. Register the host. Run the following command on the host that will
   install the packages; the command creates the host's private key and a
   certificate signing request, `client.csr`, and prints the location of the
   request:

    ```bash
    sudo pgedge-subscription-manager register-system
    ```

    To copy the request to a specific directory, add `--out` and the
    directory; for example, `--out ~/pgedge`.

3. Email the `client.csr` file to pgEdge support at `support@pgedge.com`; do
   not send the private key (`client.key`). In the email, include:

    - your organization's name and customer ID.
    - the type of certificate you need: a trial or a paid subscription.
    - how long the host needs access to the repository; a trial provides 30
      days of access by default.

    If you register several hosts, you can include all of their requests in
    one email. Every request is named `client.csr`, so rename each copy to
    identify the host before you attach it; for example, `db1-client.csr`.

    pgEdge returns your certificate, `client.crt`, by email.

4. Copy `client.crt` to the host, then install the certificate. The following
   command checks that the certificate matches the host's private key,
   installs it, and enables the repository:

    ```bash
    sudo pgedge-subscription-manager install complete_path_to/client.crt
    ```

    Include the complete path to the location of the `client.crt` file.

With the certificate installed, the host can install and update pgEdge
packages as usual. If you run into problems, email `support@pgedge.com` or
open a support ticket.

The repository stays disabled until a certificate is installed, so the
`pgedge` repository cannot interfere with your other package operations
before then.

The following table describes where the tool keeps the files on each
platform:

| Platform | Directory | Files |
|----------|-----------|-------|
| Enterprise Linux | `/etc/pki/pgedge` | `client.key`, `client.csr`, and `client.crt` |
| Debian and Ubuntu | `/etc/pgedge` | `client.key`, `client.csr`, and `client.crt`; the `_apt` user owns `client.key` so that `apt` can read it |

To see what is installed, when the certificate expires, and whether the
repository responds, use the command:

```bash
sudo pgedge-subscription-manager status
```

### Understanding Certificate and Access Expiry

Your certificate and your access to the repository expire separately:

- The certificate expiry date is written into `client.crt`. If your access
  continues past that date, pgEdge sends you a new certificate. Install it
  with the same `install` command, adding `--force` to replace the current
  certificate.
- Your access expiry is managed by pgEdge, not stored in the certificate.
  pgEdge can extend your access without sending you a new certificate, so
  there is nothing for you to install.

Your access can end before your certificate expires; for example, the
certificate for a 30-day evaluation can stay valid after the evaluation's
access period ends. The `pgedge-subscription-manager status` command reports
the certificate's expiry date:

```bash
sudo pgedge-subscription-manager status
```

Ask pgEdge support for your access expiry.

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
