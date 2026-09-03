#!/usr/bin/env python3
"""Post-process a built site: write `_redirects`, and exclude old versions
from the search index.

This ran as an MkDocs `on_post_build` hook until the build stopped being an
MkDocs implementation detail. It has to run after MkDocs and before Pagefind,
because the search exclusions are HTML attributes that Pagefind reads when it
indexes.

1. Writes a Cloudflare Pages `_redirects` file with splat rules for legacy URL
   prefixes (`/spock_ext/*` to `/spock-v5/v5-0-11/:splat`) and for versions
   retired from the nav.

   Note that there are deliberately no splat rules for a versioned docset's own
   subpaths (`/ace/*` to `/ace/v2-1-1/:splat`): Cloudflare Pages evaluates
   `_redirects` before static files, so such a rule redirects the very pages it
   points at, in a loop. Unversioned subpaths are handled client-side by
   `overrides/404.html` instead. Retired versions are safe because their source
   and target prefixes differ and the source no longer exists in the build.

   See https://developers.cloudflare.com/pages/configuration/redirects/

2. Injects `data-pagefind-ignore` into non-latest version pages, so search
   returns the current version of a page rather than five versions of it.
"""

import argparse
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from expand_imports import load_yaml  # noqa: E402

# Legacy URL prefixes that have been renamed.
# Maps old prefix -> current versioned docset slug.
LEGACY_PREFIXES = {
    'spock_ext': 'spock-v5',
    'pgedge-mcp': 'pgedge-postgres-mcp-server',
    'pgedge-postgres-mcp': 'pgedge-postgres-mcp-server',
}

# Cloudflare Pages allows 100 dynamic (splat) rules per deployment; past that
# the platform's answer is Bulk Redirects.
DYNAMIC_RULE_BUDGET = 100

# Versions that were retired from the nav to stay under Cloudflare Pages'
# 20,000-file-per-deployment limit. Maps the retired version path -> the
# nearest surviving version. Emitted as splat rules so deep links keep
# working where the page still exists in the surviving version.
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


def log(message):
    print(f"postprocess: {message}")


def latest_version(site_dir, docset):
    """The latest version slug for a docset, from its generated index.html.

    `overrides/redirect.html` writes a meta refresh pointing at the latest
    version, so read that rather than reimplementing the version logic and
    having two answers to the same question.
    """
    index_path = os.path.join(site_dir, docset, 'index.html')
    if not os.path.exists(index_path):
        return None

    with open(index_path) as f:
        match = re.search(r'content="0;\s*url=(/[^"]+)"', f.read())
    if not match:
        return None

    # "/ace/v2-1-1/" -> "v2-1-1"
    parts = match.group(1).strip('/').split('/')
    return parts[1] if len(parts) >= 2 else None


def exclude_old_versions_from_search(site_dir, versioned_docsets):
    """Add data-pagefind-ignore to non-latest version pages.

    Pagefind's root selector here is `article.md-content__inner`; putting the
    attribute on the root selector element excludes the whole page.
    """
    total = 0
    for docset in versioned_docsets:
        version_slug = latest_version(site_dir, docset)
        docset_dir = os.path.join(site_dir, docset)
        if not version_slug or not os.path.isdir(docset_dir):
            continue

        for entry in sorted(os.listdir(docset_dir)):
            entry_path = os.path.join(docset_dir, entry)
            if not os.path.isdir(entry_path) or entry == version_slug:
                continue

            count = 0
            for root, _dirs, files in os.walk(entry_path):
                for filename in files:
                    if not filename.endswith('.html'):
                        continue
                    filepath = os.path.join(root, filename)
                    with open(filepath) as f:
                        content = f.read()
                    if 'data-pagefind-ignore' in content:
                        continue
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
                log(f"excluded {count} pages from search index: {docset}/{entry}/")
                total += count

    if total:
        log(f"total: excluded {total} non-latest version pages from search index")


def count_dynamic_rules(text):
    """Count dynamic (splat/placeholder) rules in a _redirects body.

    Cloudflare budgets these separately from static rules, and a _redirects
    shipped in docs/ is appended to what this generates, so the deployment's
    real total is whatever ends up in the file.
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


def legacy_rules(site_dir):
    rules = []
    for prefix, docset in LEGACY_PREFIXES.items():
        version_slug = latest_version(site_dir, docset)
        if version_slug:
            rules.append(f'/{prefix}/* /{docset}/{version_slug}/:splat 301')
    return rules


def retired_rules(site_dir):
    """Rules for retired versions, checked against what was actually built.

    RETIRED_VERSIONS is hand-maintained alongside manual nav edits, so verify
    each pair before emitting it. A restored source is the dangerous case:
    Pages evaluates _redirects before static assets, so a rule whose source
    directory exists again would build every page of that version and then hide
    all of them behind a 301. A missing target is skipped too, since
    redirecting to a path that is not in the deployment only adds a hop before
    the same 404 whilst consuming a rule from the dynamic-rule budget.
    """
    rules = []
    for old_path, new_path in RETIRED_VERSIONS.items():
        if os.path.isdir(os.path.join(site_dir, old_path)):
            log(f"ERROR: RETIRED_VERSIONS lists {old_path}, but it was built into "
                f"the site — the redirect would make every one of its pages "
                f"unreachable. Skipping the rule; remove the entry now that the "
                f"version is back.")
            continue
        if not os.path.isdir(os.path.join(site_dir, new_path)):
            log(f"WARNING: RETIRED_VERSIONS points {old_path} at {new_path}, which "
                f"is not in the built site — the redirect would only add a hop "
                f"before the same 404. Skipping the rule; retarget it at a "
                f"surviving version.")
            continue
        rules.append(f'/{old_path}/* /{new_path}/:splat 301')
    return rules


def write_redirects(site_dir):
    legacy = legacy_rules(site_dir)
    retired = retired_rules(site_dir)
    if not legacy and not retired:
        return

    lines = ['# Auto-generated by scripts/postprocess_site.py',
             '# Cloudflare Pages splat redirects for legacy URL prefixes',
             '']
    if legacy:
        lines += ['# Legacy prefix redirects', *legacy, '']
        log(f"generated {len(legacy)} legacy prefix redirect rules")
    if retired:
        lines += ['# Retired version redirects', *retired, '']
        log(f"generated {len(retired)} retired version redirect rules")

    # A _redirects shipped in docs/ is already in the site; keep it, after ours.
    redirects_path = os.path.join(site_dir, '_redirects')
    existing = ''
    if os.path.exists(redirects_path):
        with open(redirects_path) as f:
            existing = f.read()

    final = '\n'.join(lines) + ('\n' + existing if existing else '')
    with open(redirects_path, 'w') as f:
        f.write(final)

    dynamic = count_dynamic_rules(final)
    log(f"wrote {len(legacy) + len(retired)} redirect rules to {redirects_path} "
        f"({dynamic}/{DYNAMIC_RULE_BUDGET} of the Cloudflare Pages dynamic-rule "
        f"budget in the final file)")
    if dynamic > DYNAMIC_RULE_BUDGET * 0.8:
        log(f"WARNING: {dynamic} dynamic redirect rules is within 20% of "
            f"Cloudflare Pages' {DYNAMIC_RULE_BUDGET}-rule limit. Retire the "
            f"oldest entries from RETIRED_VERSIONS or move them to the "
            f"client-side handling in 404.html.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="mkdocs.yml")
    parser.add_argument("--site", default="site")
    args = parser.parse_args()

    config = load_yaml(Path(args.config).read_text())
    versioned_docsets = config.get("extra", {}).get("versioned_docsets", [])

    write_redirects(args.site)
    exclude_old_versions_from_search(args.site, versioned_docsets)
    return 0


if __name__ == "__main__":
    sys.exit(main())
