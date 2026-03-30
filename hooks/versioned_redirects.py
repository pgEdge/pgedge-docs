"""
MkDocs hook to automatically generate redirect pages for versioned docsets.

This hook:
1. (pre-build) Creates index.md files in each versioned docset directory that
   redirect to the latest version via the redirect.html template.
2. (post-build) Generates static HTML redirect files for all subpaths within
   versioned docsets, so that unversioned URLs (e.g. /ace/commands/diff/)
   redirect to the latest versioned equivalent (e.g. /ace/v1-7-1/commands/diff/).
   This ensures search engines see real pages instead of 404s.
3. (post-build) Generates redirect files for legacy URL prefixes that have been
   renamed (e.g. /spock_ext/* -> /spock-v5/*).
"""

import os
import re
import logging

log = logging.getLogger('mkdocs.hooks.versioned_redirects')

REDIRECT_CONTENT = """---
template: redirect.html
---
"""

# Static HTML template for post-build redirect pages.
# Uses both meta refresh (followed by search engines) and JS redirect.
REDIRECT_HTML = """\
<!DOCTYPE html>
<html>
<head>
<link rel="canonical" href="{canonical}">
<meta http-equiv="refresh" content="0; url={url}">
<script>window.location.replace("{url}");</script>
<title>Redirecting...</title>
</head>
<body>
<p>This page has moved. If you are not redirected, <a href="{url}">click here</a>.</p>
</body>
</html>
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


def _generate_subpath_redirects(site_dir, site_url, docset, version_slug,
                                target_prefix=None):
    """Generate redirect HTML files for all subpaths in a versioned docset.

    For each index.html in site/<docset>/<version>/<subpath>/index.html,
    creates a redirect at site/<target_prefix>/<subpath>/index.html pointing
    to /<docset>/<version>/<subpath>/.

    Args:
        site_dir: Path to the built site directory.
        site_url: The site's base URL (for canonical links).
        docset: The docset slug (e.g. "ace", "spock-v5").
        version_slug: The latest version slug (e.g. "v1-7-1").
        target_prefix: The prefix for redirect files. Defaults to docset.
            Use a different value for legacy prefix redirects (e.g. "spock_ext").
    """
    if target_prefix is None:
        target_prefix = docset

    version_dir = os.path.join(site_dir, docset, version_slug)
    if not os.path.isdir(version_dir):
        return 0

    count = 0
    for root, dirs, files in os.walk(version_dir):
        if 'index.html' not in files:
            continue

        # Get the relative subpath within the version directory
        rel_path = os.path.relpath(root, version_dir)
        if rel_path == '.':
            # Skip the version root — already handled by the index.md redirect
            # (but do generate it for legacy prefixes)
            if target_prefix == docset:
                continue

        # Build the unversioned output path
        if rel_path == '.':
            unversioned_dir = os.path.join(site_dir, target_prefix)
        else:
            unversioned_dir = os.path.join(site_dir, target_prefix, rel_path)
        unversioned_path = os.path.join(unversioned_dir, 'index.html')

        if os.path.exists(unversioned_path):
            continue  # Don't overwrite existing pages

        # Build the versioned destination URL
        if rel_path == '.':
            url_subpath = ''
        else:
            url_subpath = rel_path.replace(os.sep, '/') + '/'

        versioned_url = '/{}/{}/{}'.format(docset, version_slug, url_subpath)
        canonical = '{}{}/{}/{}'.format(
            site_url, docset, version_slug, url_subpath
        )

        os.makedirs(unversioned_dir, exist_ok=True)
        with open(unversioned_path, 'w') as f:
            f.write(REDIRECT_HTML.format(url=versioned_url, canonical=canonical))
        count += 1

    return count


def on_post_build(config):
    """Generate static redirect files for unversioned subpaths and legacy prefixes."""
    versioned_docsets = config.get('extra', {}).get('versioned_docsets', [])
    site_dir = config.get('site_dir', 'site')
    site_url = config.get('site_url', '').rstrip('/') + '/'

    for docset in versioned_docsets:
        version_slug = _get_latest_version(site_dir, docset)
        if not version_slug:
            log.warning(
                f"Could not determine latest version for {docset}, "
                f"skipping subpath redirects"
            )
            continue

        # Generate redirects for unversioned subpaths (e.g. /ace/commands/diff/)
        count = _generate_subpath_redirects(
            site_dir, site_url, docset, version_slug
        )
        if count:
            log.info(
                f"Generated {count} subpath redirects for "
                f"{docset} -> {docset}/{version_slug}/"
            )

        # Generate redirects for any legacy prefixes pointing to this docset
        for legacy_prefix, target_docset in LEGACY_PREFIXES.items():
            if target_docset != docset:
                continue

            count = _generate_subpath_redirects(
                site_dir, site_url, docset, version_slug,
                target_prefix=legacy_prefix
            )
            if count:
                log.info(
                    f"Generated {count} legacy redirects for "
                    f"{legacy_prefix}/ -> {docset}/{version_slug}/"
                )
