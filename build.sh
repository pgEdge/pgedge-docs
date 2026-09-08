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

fail() {
    echo "build.sh: $1" >&2
    exit 1
}

# --- Engine selection (transitional) ---------------------------------------
#
# ENGINE=zensical (the default on this branch) or ENGINE=mkdocs. This exists only
# while we evaluate Zensical as a replacement for Material for MkDocs, which
# reaches end of life on 5 November 2026. It goes away when one engine wins:
# either ENGINE=zensical becomes unconditional, or the whole block is deleted.
#
# Keeping both buildable from one tree is the point. Every real problem in this
# migration has been found by building both ways and diffing, and that stops
# being possible the moment only one engine works.
#
# The default is the branch's own choice, and deliberately so: Cloudflare Pages
# has a single project-wide build command with no per-branch override, so this
# script is the only place a branch can say how it wants to be built. A branch
# that has to be previewed under a different engine should not need anyone to
# reconfigure Pages first.
ENGINE="${ENGINE:-zensical}"

# Installing the requirements was once left to Pages, which does it itself on
# detecting requirements.txt. That only works whilst there is one environment to
# install: Zensical pulls pymdown-extensions 11.x and mkdocs-material 9.6.17
# pins ~=10.2, so the two engines cannot share a virtualenv, and the engine the
# branch actually wants has to be provisioned here rather than assumed. Pages
# will still have installed requirements.txt by the time this runs, which is
# exactly what ENGINE=mkdocs needs and is harmless otherwise.
if [ "$ENGINE" = "zensical" ]; then
    if [ ! -x .venv-zensical/bin/zensical ]; then
        echo "build.sh: provisioning the Zensical environment"
        python3 -m venv .venv-zensical || fail "could not create .venv-zensical"
        .venv-zensical/bin/pip install -q --upgrade pip \
            || fail "could not upgrade pip in .venv-zensical"
        .venv-zensical/bin/pip install -q -r requirements-zensical.txt \
            || fail "could not install requirements-zensical.txt"
    fi
    # Everything below runs from this environment, the helper scripts included:
    # their only third-party import is PyYAML, which Zensical depends on anyway.
    PATH="$PWD/.venv-zensical/bin:$PATH"
    export PATH
fi

command -v "$ENGINE" >/dev/null 2>&1 || fail "$ENGINE is not on PATH"

# The nav in mkdocs.yml carries `!import` entries that MkDocs itself does not
# understand; this resolves them and writes mkdocs.gen.yml, which is what
# builds. See scripts/expand_imports.py.
python3 scripts/expand_imports.py

# Rewrites GitHub alerts as admonitions and `<redoc>` tags as iframes, in the
# staged tree, for both engines. This was the work of the gh-admonitions and
# redoc-tag MkDocs plugins, which Zensical cannot load; doing it here keeps one
# source of truth and keeps the two engines' output diffable. See
# scripts/preprocess_docs.py.
python3 scripts/preprocess_docs.py

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

# The API reference pages embed Redoc in an iframe (see preprocess_docs.py),
# which needs the Redoc browser bundle. It is fetched here rather than committed
# because it is a megabyte of minified JavaScript, and pinned by version and
# digest for the same reason `npx pagefind` is pinned below: an upstream release
# should not be able to change what we publish without a change here. Bumping it
# means updating both the version and the digest.
REDOC_VERSION="2.5.3"
REDOC_SHA256="1320f442151c57c447d3b70c7ffc6c4f86d08464020fe34c8cc5d3164e9944f0"
REDOC_BUNDLE="site/assets/redoc/redoc.standalone.js"

mkdir -p site/assets/redoc
curl -sfL --retry 3 -o "$REDOC_BUNDLE" \
    "https://cdn.jsdelivr.net/npm/redoc@${REDOC_VERSION}/bundles/redoc.standalone.js" \
    || fail "could not download Redoc ${REDOC_VERSION}"

# sha256sum on the Pages build image, shasum on a Mac; neither is everywhere.
if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$REDOC_BUNDLE" | cut -d' ' -f1)
else
    actual=$(shasum -a 256 "$REDOC_BUNDLE" | cut -d' ' -f1)
fi
[ "$actual" = "$REDOC_SHA256" ] \
    || fail "the Redoc ${REDOC_VERSION} bundle does not match its pinned digest (got $actual)"

# The redark dark theme is vendored under docs/assets/redoc, so it arrives via
# the engine's static file copying rather than the download above; check it
# survived, because the theme also writes into site/assets.
[ -f site/assets/redoc/redark.js ] \
    || fail "the vendored redark theme is missing from site/assets/redoc"

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

[ -f site/index.html ] || fail "site/index.html is missing"
[ -f site/pagefind/pagefind.js ] || fail "the Pagefind index was not generated"

count=$(find site -type f | wc -l | tr -d ' ')
[ "$count" -ge "$MIN_FILES" ] \
    || fail "only $count files were built, expected at least $MIN_FILES — the external documentation imports have probably failed"

echo "build.sh: built $count files"
