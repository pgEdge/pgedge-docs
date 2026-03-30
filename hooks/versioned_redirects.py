"""
MkDocs hook to automatically generate redirect pages for versioned docsets.

This hook:
1. (pre-build) Creates index.md files in each versioned docset directory that
   redirect to the latest version via the redirect.html template.
2. (post-build) Generates a Cloudflare Pages _redirects file with splat rules
   so that unversioned URLs (e.g. /ace/commands/diff/) return a server-side
   301 redirect to the latest versioned equivalent (/ace/v1-7-1/commands/diff/).
   Also handles legacy URL prefixes (e.g. /spock_ext/* -> /spock-v5/v5-0-6/*).
"""

import os
import re
import logging

log = logging.getLogger('mkdocs.hooks.versioned_redirects')

REDIRECT_CONTENT = """---
template: redirect.html
---
"""

# Legacy URL prefixes that have been renamed.
# Maps old prefix -> current versioned docset slug.
LEGACY_PREFIXES = {
    'spock_ext': 'spock-v5',
    'pgedge-mcp': 'pgedge-postgres-mcp-server',
    'pgedge-postgres-mcp': 'pgedge-postgres-mcp-server',
}


def on_pre_build(config):
    """Generate redirect index.md files for each versioned docset."""
    versioned_docsets = config.get('extra', {}).get('versioned_docsets', [])
    docs_dir = config.get('docs_dir', 'docs')

    for docset in versioned_docsets:
        docset_dir = os.path.join(docs_dir, docset)
        index_path = os.path.join(docset_dir, 'index.md')

        # Create directory if it doesn't exist
        if not os.path.exists(docset_dir):
            os.makedirs(docset_dir)
            log.info(f"Created directory: {docset_dir}")

        # Only write if file doesn't exist or content differs
        # This prevents triggering mkdocs serve rebuild loop
        needs_write = True
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                existing_content = f.read()
            if existing_content == REDIRECT_CONTENT:
                needs_write = False

        if needs_write:
            with open(index_path, 'w') as f:
                f.write(REDIRECT_CONTENT)
            log.info(f"Generated redirect: {index_path}")

    return config


def _get_latest_version(site_dir, docset):
    """Extract the latest version slug for a docset from its generated index.html.

    The redirect.html template writes a meta refresh tag pointing to the latest
    version, so we parse that rather than re-implementing the version logic.
    """
    index_path = os.path.join(site_dir, docset, 'index.html')
    if not os.path.exists(index_path):
        return None

    with open(index_path, 'r') as f:
        content = f.read()

    match = re.search(r'content="0;\s*url=(/[^"]+)"', content)
    if not match:
        return None

    # Extract version slug from URL like "/ace/v1-7-1/"
    parts = match.group(1).strip('/').split('/')
    if len(parts) < 2:
        return None

    return parts[1]


def _exclude_old_versions_from_search(site_dir, versioned_docsets):
    """Add data-pagefind-ignore to non-latest version pages.

    Injects data-pagefind-ignore on the article.md-content__inner element
    (pagefind's root selector). When the attribute is on the root selector
    itself, pagefind excludes the entire page from the index.
    """
    total = 0
    for docset in versioned_docsets:
        version_slug = _get_latest_version(site_dir, docset)
        if not version_slug:
            continue

        docset_dir = os.path.join(site_dir, docset)
        if not os.path.isdir(docset_dir):
            continue

        # Find all version subdirectories that are NOT the latest
        for entry in os.listdir(docset_dir):
            entry_path = os.path.join(docset_dir, entry)
            if not os.path.isdir(entry_path):
                continue
            if entry == version_slug:
                continue  # Keep latest version indexed

            # Inject data-pagefind-ignore on the root selector element
            count = 0
            for root, dirs, files in os.walk(entry_path):
                for filename in files:
                    if not filename.endswith('.html'):
                        continue
                    filepath = os.path.join(root, filename)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    if 'data-pagefind-ignore' in content:
                        continue
                    # Target the pagefind root selector element
                    modified = content.replace(
                        '<article class="md-content__inner',
                        '<article data-pagefind-ignore class="md-content__inner',
                        1,
                    )
                    if modified != content:
                        with open(filepath, 'w') as f:
                            f.write(modified)
                        count += 1

            if count:
                log.info(
                    f"Excluded {count} pages from search index: "
                    f"{docset}/{entry}/"
                )
                total += count

    if total:
        log.info(
            f"Total: excluded {total} non-latest version pages "
            f"from search index"
        )


def on_post_build(config):
    """Post-build: generate _redirects and exclude old versions from search.

    1. Generates a Cloudflare Pages _redirects file with splat rules for
       legacy URL prefixes (e.g. /spock_ext/* -> /spock-v5/v5-0-6/:splat).
       These are safe from redirect loops because the source and destination
       use different path prefixes.

       NOTE: We intentionally do NOT generate splat rules for versioned docset
       subpaths (e.g. /ace/* -> /ace/v1-7-1/:splat) because Cloudflare Pages
       evaluates _redirects before static files, causing infinite redirect
       loops. Unversioned subpath redirects are handled client-side by the
       404.html template instead.

       See: https://developers.cloudflare.com/pages/configuration/redirects/

    2. Injects data-pagefind-ignore into non-latest version pages so pagefind
       only indexes the latest version of each docset.
    """
    versioned_docsets = config.get('extra', {}).get('versioned_docsets', [])
    site_dir = config.get('site_dir', 'site')

    # --- Cloudflare _redirects (legacy prefixes only) ---

    rules = []
    rules.append('# Auto-generated by versioned_redirects.py')
    rules.append('# Cloudflare Pages splat redirects for legacy URL prefixes')
    rules.append('')

    legacy_rules = []
    for legacy_prefix, target_docset in LEGACY_PREFIXES.items():
        version_slug = _get_latest_version(site_dir, target_docset)
        if not version_slug:
            continue
        legacy_rules.append(
            '/{prefix}/* /{docset}/{version}/:splat 301'.format(
                prefix=legacy_prefix,
                docset=target_docset,
                version=version_slug,
            )
        )

    if legacy_rules:
        rules.append('# Legacy prefix redirects')
        rules.extend(legacy_rules)
        rules.append('')
        log.info(
            f"Generated {len(legacy_rules)} legacy prefix redirect rules"
        )

        # Write the _redirects file to the site root
        redirects_path = os.path.join(site_dir, '_redirects')

        # If a _redirects file already exists (e.g. from docs/), prepend our rules
        existing = ''
        if os.path.exists(redirects_path):
            with open(redirects_path, 'r') as f:
                existing = f.read()

        with open(redirects_path, 'w') as f:
            f.write('\n'.join(rules))
            if existing:
                f.write('\n')
                f.write(existing)

        log.info(f"Wrote {len(legacy_rules)} redirect rules to {redirects_path}")

    # --- Pagefind: exclude old versions from search index ---

    _exclude_old_versions_from_search(site_dir, versioned_docsets)
