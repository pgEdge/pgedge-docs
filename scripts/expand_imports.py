#!/usr/bin/env python3
"""Expand `!import` nav entries without mkdocs-multirepo-plugin.

For every nav value of the form `!import <git-url>?branch=<ref>`, this fetches
that repository at that ref, copies its `docs/` tree into
`<staging>/<docset>/<version>/`, splices the imported repository's own nav into
the parent nav with every path rewritten to sit under that prefix, and writes
the fully expanded configuration to `mkdocs.gen.yml`.

The docset and version directory names are derived from the two nav labels
enclosing the import, slugified: ("Control Plane", "v0.10") becomes
`control-plane/v0-10`. An import sitting directly at the top level of the nav
uses its single label alone.

Sources are kept as one bare mirror per repository under `--cache`, so the nav's
imports resolve to one fetch per distinct repository rather than one clone per
version, which is most of the speed difference. The parent `docs/` tree is
copied into the staging directory rather than built in place, so a build never
modifies the working tree.
"""

import argparse
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yaml

IMPORT_RE = re.compile(r"^!import\s+(?P<url>[^?\s]+)(?:\?branch=(?P<ref>.+))?$")

# Every source is a GitHub repository, and every ref is a branch or tag name.
# See parse_import for why these are enforced rather than assumed.
SAFE_URL_RE = re.compile(r"^https://github\.com/[\w.-]+/[\w.-]+?(?:\.git)?/?$")
SAFE_REF_RE = re.compile(r"^[A-Za-z0-9][\w./-]*$")


# --- YAML handling ---------------------------------------------------------
#
# mkdocs.yml carries `!!python/name:` tags that SafeLoader refuses, and the
# imported configs carry whatever their authors put there. Preserve any tag we
# do not understand rather than dropping it, so the generated config is a
# faithful copy of the original.

class Tagged:
    """A scalar carrying a YAML tag this script does not interpret."""

    def __init__(self, tag, value):
        self.tag = tag
        self.value = value


class Loader(yaml.SafeLoader):
    """For imported configs, of which only the nav is ever read."""


class StrictLoader(yaml.SafeLoader):
    """For mkdocs.yml, every part of which is written back out again."""


class Dumper(yaml.SafeDumper):
    pass


def _keep_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.ScalarNode):
        return Tagged(node.tag, node.value)
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


def _refuse_tagged_collection(loader, tag_suffix, node):
    if isinstance(node, yaml.ScalarNode):
        return Tagged(node.tag, node.value)
    # A tagged sequence or mapping would come back out of the dumper without
    # its tag, quietly changing the generated config. Nothing in mkdocs.yml
    # uses one today, so refuse rather than carry that silently.
    raise RuntimeError(
        f"{node.tag} tags a collection at line {node.start_mark.line + 1} of "
        f"the source config; expand_imports.py can only round-trip tagged "
        f"scalars. Add support before using this."
    )


Loader.add_multi_constructor("", _keep_tag)
StrictLoader.add_multi_constructor("", _refuse_tagged_collection)
Dumper.add_representer(
    Tagged, lambda dumper, t: dumper.represent_scalar(t.tag, t.value)
)


def load_yaml(text, strict=False):
    return yaml.load(text, Loader=StrictLoader if strict else Loader)


# --- Source fetching -------------------------------------------------------

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")


def repo_key(url):
    """Normalise a source URL to one key per repository.

    mkdocs.yml spells some sources both with and without a `.git` suffix
    (pgedge-safesession appears both ways), and those must share a mirror.
    """
    return slug(url.rstrip("/").removesuffix(".git").split("github.com/")[-1])


class Mirrors:
    """One bare mirror per repository, fetched at most once per run."""

    def __init__(self, cache_dir, jobs):
        self.cache = Path(cache_dir)
        self.jobs = jobs
        self.paths = {}

    def prime(self, urls):
        """Clone or update every distinct repository, in parallel."""
        distinct = {}
        for url in urls:
            distinct.setdefault(repo_key(url), url)

        self.cache.mkdir(parents=True, exist_ok=True)
        with ThreadPoolExecutor(max_workers=self.jobs) as pool:
            for key, path in pool.map(
                lambda kv: (kv[0], self._sync(kv[0], kv[1])), distinct.items()
            ):
                self.paths[key] = path

    def _sync(self, key, url):
        dest = self.cache / f"{key}.git"
        if (dest / "HEAD").exists():
            run(["git", "--git-dir", str(dest), "fetch", "--force", "--prune",
                 "--tags", "origin", "+refs/heads/*:refs/heads/*"])
        else:
            run(["git", "clone", "--bare", "--quiet", "--",
                 url.rstrip("/").removesuffix(".git") + ".git", str(dest)])
        return dest

    def path_for(self, url):
        return self.paths[repo_key(url)]


def run(cmd, **kwargs):
    result = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if result.returncode != 0:
        raise RuntimeError(
            f"{' '.join(str(c) for c in cmd)} failed:\n{result.stderr.strip()}"
        )
    return result.stdout


def export_docs(git_dir, ref, target):
    """Materialise <ref>:docs/ into target, and return <ref>:mkdocs.yml."""
    target.mkdir(parents=True, exist_ok=True)
    try:
        run(["git", "--git-dir", str(git_dir), "cat-file", "-e", f"{ref}:docs"])
    except RuntimeError:
        raise RuntimeError(f"{git_dir.name} has no docs/ directory at {ref}")

    archive = subprocess.Popen(
        ["git", "--git-dir", str(git_dir), "archive", ref, "docs"],
        stdout=subprocess.PIPE,
    )
    extract = subprocess.Popen(
        ["tar", "-x", "--strip-components=1", "-C", str(target)],
        stdin=archive.stdout,
    )
    archive.stdout.close()  # so git sees EPIPE if tar dies first
    extract.wait()
    archive.wait()
    if archive.returncode or extract.returncode:
        raise RuntimeError(
            f"extracting {ref}:docs/ from {git_dir.name} failed "
            f"(git {archive.returncode}, tar {extract.returncode})"
        )

    config = subprocess.run(
        ["git", "--git-dir", str(git_dir), "show", f"{ref}:mkdocs.yml"],
        capture_output=True, text=True,
    )
    return load_yaml(config.stdout) if config.returncode == 0 else {}


# --- Markdown extension union -----------------------------------------------

def _extension_shape(entry):
    """A markdown_extensions entry as ('name', config-or-None)."""
    if isinstance(entry, dict):
        name = next(iter(entry))
        return name, entry[name]
    return entry, None


def _normalize(value):
    """Make a Tagged-bearing structure comparable, ignoring dict key order."""
    if isinstance(value, Tagged):
        return ("!tag", value.tag, value.value)
    if isinstance(value, dict):
        return tuple(sorted((k, _normalize(v)) for k, v in value.items()))
    if isinstance(value, list):
        return tuple(_normalize(v) for v in value)
    return value


def merge_markdown_extensions(parent_extensions, sources):
    """Add the bare extensions imported sources rely on; report the rest.

    Imported content is frozen at its tag, so an extension a source relies on
    and this repository does not enable renders as literal text rather than
    failing the build (this is what broke the pgEdge Labs banner on three
    docsets: their markdown used md_in_html and attr_list, this repository
    used neither, and the div and its contents came through unrendered).

    A *bare* extension, one with no config, is safe to add on sight: enabling
    it cannot change how any other page renders. A *configured* one is not,
    because markdown_extensions is one global list for the whole site, so a
    source's `toc: {permalink: true}` would turn permalinks on everywhere, not
    just for that source's pages. Those are reported rather than merged, for a
    human to decide whether to adopt them site-wide.

    sources: iterable of (label, entries), entries being one source's own
    markdown_extensions list and label identifying it for the report.
    """
    parent = dict(_extension_shape(e) for e in parent_extensions)

    uses = {}
    for label, entries in sources:
        for entry in entries or []:
            name, cfg = _extension_shape(entry)
            uses.setdefault(name, []).append((label, cfg))

    added, conflicts = [], []
    for name, occurrences in sorted(uses.items()):
        if name in parent:
            for label, cfg in occurrences:
                if cfg is not None and _normalize(cfg) != _normalize(parent[name]):
                    conflicts.append((name, label, cfg, "differs from our config"))
            continue
        configured = [(label, cfg) for label, cfg in occurrences if cfg is not None]
        if configured:
            for label, cfg in configured:
                conflicts.append((name, label, cfg, "not enabled here at all"))
        else:
            added.append(name)

    print(f"Markdown extensions: {len(added)} added from imported sources"
          + (f" ({', '.join(added)})" if added else ""))
    if conflicts:
        print(f"WARNING: {len(conflicts)} imported source(s) declare a configured "
              f"markdown extension this repository handles differently. Their "
              f"content still renders using our config (or none, if we lack the "
              f"extension entirely), which may not be what they intended:")
        for name, label, cfg, reason in conflicts:
            print(f"  {name} ({label}): {reason} — {cfg}")

    return parent_extensions + added


# --- Nav rewriting ---------------------------------------------------------

def reprefix(node, prefix):
    """Rewrite an imported nav's document paths to sit under prefix."""
    if isinstance(node, list):
        return [reprefix(n, prefix) for n in node]
    if isinstance(node, dict):
        return {k: reprefix(v, prefix) for k, v in node.items()}
    if isinstance(node, str) and "://" not in node:
        return f"{prefix}/{node}"
    return node


def parse_import(node, trail):
    """Parse and validate one `!import` string into (url, ref).

    Both values are handed to git as command arguments, so they are checked
    against what a source can legitimately look like rather than trusted. A ref
    beginning with `-` would otherwise be read by git as an option, and git
    accepts URL schemes such as `ext::` that execute a command; neither is
    reachable from a well-formed mkdocs.yml, and neither should be reachable
    from a malformed one either.
    """
    match = IMPORT_RE.match(node.strip())
    if not match:
        raise RuntimeError(f"Unparseable import at {'/'.join(trail)}: {node}")

    url, ref = match["url"], match["ref"] or "HEAD"
    if not SAFE_URL_RE.match(url):
        raise RuntimeError(f"Refusing import from {url!r} at {'/'.join(trail)}")
    if not SAFE_REF_RE.match(ref):
        raise RuntimeError(f"Refusing ref {ref!r} at {'/'.join(trail)}")
    return url, ref


def find_imports(node, trail=()):
    """Yield (trail, url, ref) for every !import in the nav."""
    if isinstance(node, list):
        for item in node:
            yield from find_imports(item, trail)
    elif isinstance(node, dict):
        for key, value in node.items():
            yield from find_imports(value, trail + (key,))
    elif isinstance(node, str) and node.startswith("!import"):
        yield (trail, *parse_import(node, trail))


def prefix_for(trail):
    """('Control Plane', 'v0.10') -> 'control-plane/v0-10'."""
    labels = trail[-2:] if len(trail) > 1 else trail[-1:]
    return "/".join(slug(label) for label in labels)


def substitute(node, expanded, trail=()):
    """Replace each !import with the imported nav, keyed by its trail."""
    if isinstance(node, list):
        return [substitute(n, expanded, trail) for n in node]
    if isinstance(node, dict):
        return {k: substitute(v, expanded, trail + (k,)) for k, v in node.items()}
    if isinstance(node, str) and node.startswith("!import"):
        return expanded[trail]
    return node


# --- Versioned docset metadata ---------------------------------------------

# Anchored on the left so that an ordinary word containing the letters is not
# read as a pre-release: "source" contains "rc". Not \b, because that would
# stop matching the digit-adjacent form upstream projects use, as in 19beta2.
PRERELEASE_RE = re.compile(r"(?<![A-Za-z])(alpha|beta|rc)", re.I)


def docset_versions(imports, versioned_docsets):
    """The versions of each docset, in nav order, with the latest one marked.

    Templates used to derive this by walking the nav and slugifying titles in
    Jinja. Doing it here instead means the version logic has one home, in a
    language with a `sorted`, rather than being spread across two templates.

    "Latest" is what a docset's root URL redirects to, what the version selector
    badges, and what an unversioned URL falls back to in 404.html. It prefers
    the newest stable release, falling back to the newest pre-release and then
    to Development, so that PostgreSQL lands on v18 rather than the v19 beta
    whilst a product whose only release is a beta still lands somewhere.

    A docset's nav is required to list its versions newest first, which is the
    convention throughout mkdocs.yml and what the README asks for when a docset
    is added. Nothing here compares version numbers, so a docset listed out of
    order will point at whichever matching version comes first.
    """
    by_docset = {}
    for trail, _url, _ref in imports:
        if len(trail) < 2:
            continue
        docset, title = slug(trail[-2]), str(trail[-1])
        if docset not in versioned_docsets:
            continue
        by_docset.setdefault(docset, []).append({
            "title": title,
            "slug": slug(title),
            "development": title == "Development",
            "prerelease": bool(PRERELEASE_RE.search(title)),
            "latest": False,
        })

    for versions in by_docset.values():
        stable = [v for v in versions if not v["development"] and not v["prerelease"]]
        released = [v for v in versions if not v["development"]]
        (stable or released or versions)[0]["latest"] = True

    return by_docset


# --- Versioned docset stubs ------------------------------------------------

# Rendered by overrides/redirect.html, which resolves the latest version from
# the nav and emits a meta refresh to it. This gives every versioned docset a
# root URL: /ace/ lands on /ace/v2-1-1/.
REDIRECT_STUB = """---
template: redirect.html
---
"""


def write_redirect_stubs(staging, config):
    """Create <docset>/index.md in the staging tree for each versioned docset."""
    written = 0
    for docset in config.get("extra", {}).get("versioned_docsets", []):
        index_path = staging / docset / "index.md"
        index_path.parent.mkdir(parents=True, exist_ok=True)
        if not index_path.exists() or index_path.read_text() != REDIRECT_STUB:
            index_path.write_text(REDIRECT_STUB)
            written += 1
    return written


# --- Main ------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="mkdocs.yml")
    parser.add_argument("--out", default="mkdocs.gen.yml")
    parser.add_argument("--staging", default="build/docs")
    parser.add_argument("--cache", default=".import-cache")
    parser.add_argument("--jobs", type=int, default=8)
    parser.add_argument("--dry-run", action="store_true",
                        help="Report what each import resolves to and stop.")
    args = parser.parse_args()

    root = Path(args.config).resolve().parent
    config = load_yaml(Path(args.config).read_text(), strict=True)
    imports = list(find_imports(config.get("nav", [])))

    if args.dry_run:
        for trail, url, ref in imports:
            print(f"{prefix_for(trail):<48} {repo_key(url)}@{ref}")
        print(f"\n{len(imports)} imports from "
              f"{len({repo_key(u) for _, u, _ in imports})} repositories")
        return 0

    staging = root / args.staging
    if staging.exists():
        shutil.rmtree(staging)
    shutil.copytree(root / config.get("docs_dir", "docs"), staging)

    mirrors = Mirrors(root / args.cache, args.jobs)
    print(f"Fetching {len({repo_key(u) for _, u, _ in imports})} repositories...")
    mirrors.prime(url for _, url, _ in imports)

    def fetch_one(job):
        trail, url, ref = job
        prefix = prefix_for(trail)
        imported = export_docs(mirrors.path_for(url), ref, staging / prefix)
        nav = imported.get("nav")
        nav_result = reprefix(nav, prefix) if nav else f"{prefix}/index.md"
        return trail, nav_result, prefix, imported.get("markdown_extensions")

    print(f"Importing {len(imports)} versions...")
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        results = list(pool.map(fetch_one, imports))
    expanded = {trail: nav_result for trail, nav_result, _, _ in results}

    config["markdown_extensions"] = merge_markdown_extensions(
        config.get("markdown_extensions", []),
        [(prefix, exts) for _, _, prefix, exts in results],
    )

    stubs = write_redirect_stubs(staging, config)
    print(f"Wrote {stubs} versioned docset redirect stubs")

    extra = config.setdefault("extra", {})
    extra["docset_versions"] = docset_versions(
        imports, extra.get("versioned_docsets", [])
    )
    # The same answer keyed for the one question redirect.html asks.
    extra["docset_latest"] = {
        docset: next(v["slug"] for v in versions if v["latest"])
        for docset, versions in extra["docset_versions"].items()
    }

    config["nav"] = substitute(config["nav"], expanded)
    config["docs_dir"] = args.staging

    Path(args.out).write_text(
        "# Generated by scripts/expand_imports.py. Do not edit.\n"
        + yaml.dump(config, Dumper=Dumper, sort_keys=False, allow_unicode=True)
    )
    print(f"Wrote {args.out} ({len(imports)} imports expanded into {staging})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
