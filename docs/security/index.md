# pgEdge Vulnerability Disclosure Statement

pgEdge welcomes reports of security vulnerabilities in our products.

## Reporting

Email [**security@pgedge.com**](mailto:security@pgedge.com). Tell us the
product and version, what the impact is, and how to reproduce it. Please
do not open a public issue for a suspected vulnerability.

You do not need to sign anything or hold a pgEdge contract to report to
us. We acknowledge reports within five business days, tell you the
outcome of our assessment, and tell you before we publish anything.

## Scope

**pgEdge software you run yourself** is in scope: our self-managed
products, command line tools, PostgreSQL extensions, container images,
and libraries we publish for use in other software. Our public
repositories are at `github.com/pgEdge`. You may test these freely in an
environment you control, and need no permission from us to do so.

**Testing pgEdge Cloud requires prior written authorisation.** It is a
shared production service, so unauthorised testing risks other
customers' data and is not covered by the safe harbour below. Customers
wanting to test their own environment should start from their agreement
with us. If you are not a customer and believe you have found an issue
in Cloud, tell us what you observed and stop there - we would rather
have a partial report than one obtained by probing a live service. We
will not penalise anyone who encounters an issue incidentally and stops
to report it.

**We are unlikely to act on** automated scanner output with no
demonstrated impact, denial of service by traffic volume alone, or
reports about a language model's output quality, accuracy or refusal
behaviour. Our products integrate language models, and model behaviour
that crosses a security boundary is in scope - untrusted content
reaching a privileged position in a prompt, causing a privileged action
to be taken, or causing data or credentials to be disclosed. A model
simply answering poorly is not. If you think something here does have
security impact in our products, say so and explain why.

## Safe harbour

If you research a vulnerability in good faith under this statement, we
will consider that research authorised and will not pursue or support
legal action against you over it.

Good faith means you do not access, modify or retain anyone else's data,
and stop as soon as you establish that you could; do not degrade our
services or our customers'; do not use a finding to extract payment or
publicity; give us a reasonable opportunity to fix the issue before
publishing; and comply with applicable law.

This does not authorise testing pgEdge Cloud, or any system belonging to
a pgEdge customer.

## Credit

We credit reporters in published advisories however you prefer,
including anonymously - tell us when you report. We do not operate a
paid bug bounty programme.

## Advisories and CVE identifiers

Advisories are published as GitHub Security Advisories in the repository
of the affected product, under its Security tab, and are discoverable in
the GitHub Advisory Database at `github.com/advisories`. For our Go
libraries they reach the Go vulnerability database, so `govulncheck` and
Dependabot will report them to you.

We request a CVE identifier where the vulnerable code was present in a
released version and is reachable by someone other than the operator of
the software. We do not request one for a fix to code that was never
released, or where a trusted, operator-configured component would have
to misbehave. CVE identifiers belonging to dependencies we consume are
referenced in our release notes, not re-filed by us.

## Supported versions

Security fixes are provided for the latest release of each product.
Where a product has its own published support lifecycle, that lifecycle
governs.
