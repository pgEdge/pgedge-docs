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
mkdocs build -v

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
