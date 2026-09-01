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

# Versions that were retired from the nav to stay under Cloudflare Pages'
# 20,000-file-per-deployment limit. Maps the retired version path -> the
# nearest surviving version. Emitted as splat rules so deep links keep
# working where the page still exists in the surviving version.
#
# Cloudflare Pages allows 100 dynamic (splat) rules per deployment; these
# plus LEGACY_PREFIXES are well inside that budget.
DYNAMIC_RULE_BUDGET = 100  # Cloudflare Pages' per-deployment splat-rule limit

RETIRED_VERSIONS = {
    'ace/v1-7-2': 'ace/v1-8-0',
    'ace/v1-7-1': 'ace/v1-8-0',
    'ace/v1-7-0': 'ace/v1-8-0',
    'ace/v1-6-0': 'ace/v1-8-0',
    'ace/v1-5-5': 'ace/v1-8-0',
    'ace/v1-5-4': 'ace/v1-8-0',
    'ace/v1-5-3': 'ace/v1-8-0',
    'ace/v1-5-2': 'ace/v1-8-0',
    'ace/v1-5-1': 'ace/v1-8-0',
    'ace/v1-4-2': 'ace/v1-8-0',
    'ace/v1-4-1': 'ace/v1-8-0',
    'ace/v1-4-0': 'ace/v1-8-0',
    'coldfront/v1-0-0-beta1': 'coldfront/v1-0-0-beta2',
    'control-plane/v0-7': 'control-plane/v0-8',
    'control-plane/v0-6': 'control-plane/v0-8',
    'pgadmin-4/v9-11': 'pgadmin-4/v9-12',
    'pgvector/v0-8-0': 'pgvector/v0-8-1',
    'postgis/v3-5-5': 'postgis/v3-5-6',
    'postgis/v3-6-2': 'postgis/v3-6-3',
    'postgrest/v14-7': 'postgrest/v14-8',
    'postgrest/v14-6': 'postgrest/v14-8',
    'postgrest/v14-5': 'postgrest/v14-8',
    'radar/v0-3-0': 'radar/v0-4-0',
    'radar/v0-2-3': 'radar/v0-4-0',
    'radar/v0-2-2': 'radar/v0-4-0',
    'radar/v0-1-0': 'radar/v0-4-0',
    'spock-v5/v5-0-8': 'spock-v5/v5-0-9',
    'spock-v5/v5-0-6': 'spock-v5/v5-0-9',
    'spock-v5/v5-0-5': 'spock-v5/v5-0-9',
    'spock-v5/v5-0-4': 'spock-v5/v5-0-9',
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


def _count_dynamic_rules(text):
    """Count dynamic (splat/placeholder) rules in a _redirects body.

    Cloudflare budgets these separately from static rules, and a
    _redirects shipped in docs/ is appended to what this hook generates,
    so the deployment's real total is whatever ends up in the file.
    """
    count = 0
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        source = line.split()[0]
        if '*' in source or ':' in source:
            count += 1
    return count


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

    # RETIRED_VERSIONS is hand-maintained alongside manual nav edits, so
    # verify each pair against what was actually built before emitting it.
    #
    # A restored source is the dangerous case: Pages evaluates _redirects
    # before static assets (see the note in this function's docstring), so
    # a rule whose source directory exists again would build every page of
    # that version and then hide all of them behind a 301. Drop the rule
    # rather than ship that, and log an error so the stale entry gets
    # cleaned up. A missing target is skipped too: redirecting to a path
    # that is not in the deployment just adds a hop before the same 404,
    # while consuming a rule from the dynamic-rule budget.
    retired_rules = []
    for old_path, new_path in RETIRED_VERSIONS.items():
        if os.path.isdir(os.path.join(site_dir, old_path)):
            log.error(
                f"RETIRED_VERSIONS lists {old_path}, but it was built into "
                f"the site — the redirect would make every one of its pages "
                f"unreachable. Skipping the rule; remove the entry from "
                f"hooks/versioned_redirects.py now that the version is back."
            )
            continue
        if not os.path.isdir(os.path.join(site_dir, new_path)):
            log.warning(
                f"RETIRED_VERSIONS points {old_path} at {new_path}, which is "
                f"not in the built site — the redirect would only add a hop "
                f"before the same 404. Skipping the rule; retarget it at a "
                f"surviving version."
            )
            continue
        retired_rules.append(
            '/{old}/* /{new}/:splat 301'.format(old=old_path, new=new_path)
        )

    if legacy_rules:
        rules.append('# Legacy prefix redirects')
        rules.extend(legacy_rules)
        rules.append('')
        log.info(
            f"Generated {len(legacy_rules)} legacy prefix redirect rules"
        )

    if retired_rules:
        rules.append('# Retired version redirects')
        rules.extend(retired_rules)
        rules.append('')
        log.info(
            f"Generated {len(retired_rules)} retired version redirect rules"
        )

    if legacy_rules or retired_rules:
        # Write the _redirects file to the site root
        redirects_path = os.path.join(site_dir, '_redirects')

        # If a _redirects file already exists (e.g. from docs/), prepend our rules
        existing = ''
        if os.path.exists(redirects_path):
            with open(redirects_path, 'r') as f:
                existing = f.read()

        final = '\n'.join(rules)
        if existing:
            final += '\n' + existing

        with open(redirects_path, 'w') as f:
            f.write(final)

        # Cloudflare Pages allows 100 dynamic (splat/placeholder) rules per
        # deployment; past that the platform's answer is Bulk Redirects.
        # Every retention pass appends entries and none expire, so warn
        # while there is still room to change approach. Count what the
        # deployment actually ships — a _redirects from docs/ is appended
        # here and its dynamic rules draw on the same budget.
        generated = len(legacy_rules) + len(retired_rules)
        dynamic = _count_dynamic_rules(final)
        log.info(
            f"Wrote {generated} redirect rules to {redirects_path} "
            f"({dynamic}/{DYNAMIC_RULE_BUDGET} of the Cloudflare Pages "
            f"dynamic-rule budget in the final file)"
        )
        if dynamic > DYNAMIC_RULE_BUDGET * 0.8:
            log.warning(
                f"{dynamic} dynamic redirect rules is within 20% of "
                f"Cloudflare Pages' {DYNAMIC_RULE_BUDGET}-rule limit. Retire "
                f"the oldest entries from RETIRED_VERSIONS or move them to "
                f"the client-side handling in 404.html."
            )

    # --- Pagefind: exclude old versions from search index ---

    _exclude_old_versions_from_search(site_dir, versioned_docsets)
