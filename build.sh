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
# checks at the end exist. The engine only warns when a nav entry points at a
# file that does not exist, so a build that silently loses the whole of the
# imported documentation still exits 0 and publishes. Failing here instead
# leaves the previous deployment serving.
#
# The site is built by Zensical, which replaced Material for MkDocs ahead of its
# end of life on 5 November 2026. Nothing here supports building with MkDocs any
# more; `git log` has the transitional two-engine version if it is ever wanted.

set -euo pipefail

fail() {
    echo "build.sh: $1" >&2
    exit 1
}

# Pages installs requirements.txt itself on detecting it, but nothing guarantees
# the environment a local run inherits, and Zensical must be the pinned version
# rather than whatever happens to be on PATH. Provisioning unconditionally is
# cheap: pip is idempotent, so this is a no-op once warm, and it means a changed
# pin actually takes effect locally instead of being masked by an existing
# virtualenv.
if [ ! -d .venv-docs ]; then
    echo "build.sh: creating .venv-docs"
    python3 -m venv .venv-docs || fail "could not create .venv-docs"
fi
.venv-docs/bin/pip install -q --upgrade pip || fail "could not upgrade pip"
.venv-docs/bin/pip install -q -r requirements.txt \
    || fail "could not install requirements.txt"

# Everything below runs from this environment, the helper scripts included:
# their only third-party import is PyYAML, which Zensical depends on anyway.
PATH="$PWD/.venv-docs/bin:$PATH"
export PATH

command -v zensical >/dev/null 2>&1 || fail "zensical is not on PATH"

# The nav in mkdocs.yml carries `!import` entries that the engine does not
# understand; this resolves them and writes mkdocs.gen.yml, which is what
# builds. See scripts/expand_imports.py.
python3 scripts/expand_imports.py

# Rewrites GitHub alerts as admonitions and `<redoc>` tags as iframes in the
# staged tree. This was the work of the gh-admonitions and redoc-tag MkDocs
# plugins, which Zensical cannot load, so it happens here instead. See
# scripts/preprocess_docs.py.
python3 scripts/preprocess_docs.py

zensical build -f mkdocs.gen.yml

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
# --retry alone does not bound a connection that stalls mid-transfer, and a
# wedged CDN should fail the build rather than sit there until the job times out.
# All three limits are needed: --max-time bounds one attempt and is re-armed on
# every retry, so it alone would allow four attempts plus backoff, which is the
# best part of ten minutes rather than the two it looks like.
curl -sfL --retry 3 --connect-timeout 10 --max-time 120 --retry-max-time 180 \
    -o "$REDOC_BUNDLE" \
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
