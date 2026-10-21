#!/usr/bin/env python3
"""Give every built page a markdown version at `<source path>.md`.

The markdown is not copied into the site, since Cloudflare Pages allows 20,000
files per deployment and a copy of every page would go well past it. Every
source is public on GitHub, so `functions/[[path]].js` fetches it from the
repository and ref the page was built from, using the map written here.

The `.md` URL mirrors the source file's path, `index.md` included, so relative
links inside a source file resolve to other `.md` URLs unchanged.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
from expand_imports import load_yaml, run  # noqa: E402

LOCAL_REPO = "pgEdge/pgedge-docs"

ROUTES = {
    "version": 1,
    # This file replaces the generated one, so the chat API must be listed.
    "include": ["/api/*", "/*.md"],
    "exclude": [],
}


def log(message):
    print(f"markdown_pages: {message}")


def local_ref():
    """The commit being built, so this repository's pages match the deploy."""
    sha = os.environ.get("CF_PAGES_COMMIT_SHA")
    if sha:
        return sha
    try:
        return run(["git", "rev-parse", "HEAD"]).strip()
    except RuntimeError:
        return "main"


def tracked_docs(docs_dir="docs"):
    """This repository's committed pages, relative to docs/, or None."""
    try:
        listing = run(["git", "ls-files", "-z", docs_dir])
    except RuntimeError as error:
        log(f"WARNING: every page under {docs_dir}/ is assumed committed: "
            f"{error}")
        return None
    prefix = docs_dir.rstrip("/") + "/"
    return {path[len(prefix):] for path in listing.split("\0") if path}


def page_sources(staging, site, prefixes):
    """Map each built page's directory to its staged source path.

    A page from this repository is skipped unless its source is committed,
    which leaves out the versioned docset redirect stubs the build writes:
    there is nothing on GitHub to serve for them.
    """
    tracked = tracked_docs()
    pages = {}
    for root, _dirs, files in os.walk(staging):
        for name in files:
            if not name.endswith(".md"):
                continue
            src = os.path.relpath(os.path.join(root, name), staging)
            src = src.replace(os.sep, "/")
            parent = os.path.dirname(src)
            if name in ("index.md", "README.md"):
                if name == "README.md" and "index.md" in files:
                    continue
                page = parent
            else:
                page = f"{parent}/{name[:-3]}" if parent else name[:-3]
            if not os.path.isfile(os.path.join(site, page, "index.html")):
                continue
            imported = any(src.startswith(p + "/") for p in prefixes)
            if not imported and tracked is not None and src not in tracked:
                continue
            pages[page] = src
    return pages


def add_alternate_links(site, pages):
    added = 0
    for page, src in pages.items():
        path = os.path.join(site, page, "index.html")
        with open(path, encoding="utf-8") as f:
            content = f.read()
        if 'type="text/markdown"' in content:
            continue
        link = (f'<link rel="alternate" type="text/markdown" '
                f'href="/{quote(src)}">')
        modified = content.replace("</head>", f"  {link}\n</head>", 1)
        if modified != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(modified)
            added += 1
    return added


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="mkdocs.gen.yml")
    parser.add_argument("--site", default="site")
    parser.add_argument("--staging", default="build/docs")
    args = parser.parse_args()

    config = load_yaml(Path(args.config).read_text())
    prefixes = config.get("extra", {}).get("markdown_sources")
    if not prefixes:
        log(f"ERROR: {args.config} has no extra.markdown_sources; run "
            f"scripts/expand_imports.py first")
        return 1

    sources_dir = os.path.join(args.site, "_markdown")
    os.makedirs(sources_dir, exist_ok=True)
    with open(os.path.join(sources_dir, "sources.json"), "w") as f:
        json.dump({"local": f"{LOCAL_REPO}@{local_ref()}",
                   "prefixes": prefixes}, f, indent=1, sort_keys=True)
    with open(os.path.join(args.site, "_routes.json"), "w") as f:
        json.dump(ROUTES, f, indent=1)

    pages = page_sources(args.staging, args.site, prefixes)
    added = add_alternate_links(args.site, pages)
    log(f"{len(pages)} pages have a markdown version; linked {added} of them "
        f"from their HTML")
    if not pages:
        log("ERROR: no page has a markdown version; is the staging tree there?")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
