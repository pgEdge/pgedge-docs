#!/usr/bin/env bash
#
# The build, as run by Cloudflare Pages and reproducible locally.
#
# Cloudflare Pages has a single project-wide build command with no per-branch
# override, so pointing it at this script is what puts the build definition
# under version control: a branch that needs to build differently carries its
# own copy, and production keeps whatever is on main. The Pages build command
# is therefore `bash build.sh`, and should not need changing again.
#
# Pages judges a deployment purely on this script's exit code, which is why the
# checks at the end exist. `mkdocs build` only warns when a nav entry points at
# a file that does not exist, so a build that silently loses the whole of the
# imported documentation still exits 0 and publishes. Failing here instead
# leaves the previous deployment serving.

set -euo pipefail

# Installing the requirements is deliberately not this script's job: Pages does
# it itself on detecting requirements.txt, and locally the README covers it. A
# conditional here would have to guess whether the pinned plugins are present,
# not merely mkdocs itself, and would get it wrong for anyone with a different
# mkdocs on PATH.

# --- Engine selection (transitional) ---------------------------------------
#
# ENGINE=mkdocs (default) or ENGINE=zensical. This exists only while we evaluate
# Zensical as a replacement for Material for MkDocs, which reaches end of life on
# 5 November 2026. It goes away when one engine wins: either ENGINE=zensical
# becomes unconditional, or the whole block is deleted.
#
# Keeping both buildable from one tree is the point. Every real problem in this
# migration has been found by building both ways and diffing, and that stops
# being possible the moment only one engine works.
ENGINE="${ENGINE:-mkdocs}"

# The nav in mkdocs.yml carries `!import` entries that MkDocs itself does not
# understand; this resolves them and writes mkdocs.gen.yml, which is what
# builds. See scripts/expand_imports.py.
python3 scripts/expand_imports.py

if [ "$ENGINE" = "zensical" ]; then
    # overrides/main.html needs the current page's docset and version, which
    # means splitting a string, and that is the one construct Jinja2 and
    # MiniJinja spell irreconcilably differently: `.split('/')` against
    # `| split('/') | list`. Rather than break the MkDocs build to suit
    # Zensical, the substitution happens here, into a copy, for this build only.
    # Deleting this block is part of finishing the migration.
    rm -rf build/overrides-zensical
    cp -r overrides build/overrides-zensical
    python3 - <<'PY'
from pathlib import Path
p = Path("build/overrides-zensical/main.html")
before = p.read_text()
after = before.replace(
    "(page.url | default('')).split('/')",
    "((page.url | default('')) | split('/') | list)",
)
if after == before:
    raise SystemExit("build.sh: the main.html split line changed shape; "
                     "update the Zensical substitution in build.sh")
p.write_text(after)
PY
    python3 - <<'PY'
import re
from pathlib import Path
p = Path("mkdocs.gen.yml")
text = p.read_text()
updated, n = re.subn(r"^(\s*custom_dir:\s*).*$", r"\1build/overrides-zensical",
                     text, count=1, flags=re.M)
if n != 1:
    raise SystemExit("build.sh: expected exactly one custom_dir in mkdocs.gen.yml")
p.write_text(updated)
PY
    zensical build -f mkdocs.gen.yml
else
    # Not -v: that is DEBUG, and it accounts for 64,712 of the 65,374 lines a
    # build produces, which buries the 36 warnings worth reading and overwhelms
    # the Pages deployment log. INFO still carries every warning.
    mkdocs build -f mkdocs.gen.yml
fi

# Writes _redirects and marks non-latest versions as excluded from search. Must
# run before Pagefind, which reads those exclusions when it indexes.
python3 scripts/postprocess_site.py

# Pinned, because the file count checked below depends on what Pagefind emits,
# and an unpinned `npx pagefind` would otherwise let an upstream release change
# the build without a change here.
npx -y pagefind@1.5.2 --site site --root-selector "article.md-content__inner"

# --- Sanity checks --------------------------------------------------------

# A full build is currently a little over 17,000 files. The floor is set well
# below that: it is here to catch a build that has lost the external imports
# (which would leave roughly a thousand), not to track the real figure.
MIN_FILES=10000

fail() {
    echo "build.sh: $1" >&2
    exit 1
}

[ -f site/index.html ] || fail "site/index.html is missing"
[ -f site/pagefind/pagefind.js ] || fail "the Pagefind index was not generated"

count=$(find site -type f | wc -l | tr -d ' ')
[ "$count" -ge "$MIN_FILES" ] \
    || fail "only $count files were built, expected at least $MIN_FILES — the external documentation imports have probably failed"

echo "build.sh: built $count files"
