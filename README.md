# pgEdge Documentation

This repository contains the core pgEdge product documentation and
infrastructure for generating the docs website. It is built with
[Zensical](https://zensical.org), the successor to Material for MkDocs, which
reaches end of life on 5 November 2026. The configuration is still called
`mkdocs.yml`, and Zensical reads it, so most of what is written about Material
for MkDocs still applies; the differences that bite are noted below.

Alongside the engine there are three scripts, each of which does something the
build cannot do without: `scripts/expand_imports.py` merges documentation from
other repositories into the site, `scripts/preprocess_docs.py` does the work two
MkDocs plugins used to do, and `scripts/postprocess_site.py` writes the redirects
and the sitemap.

## Build Status

[![Build Docs](https://github.com/pgEdge/pgedge-docs/actions/workflows/build-docs.yml/badge.svg)](https://github.com/pgEdge/pgedge-docs/actions/workflows/build-docs.yml)

## Building

The whole build is `build.sh`, which is also the Cloudflare Pages build command,
so what you run locally is what deploys:

```bash
git clone https://github.com/pgEdge/pgedge-docs
cd pgedge-docs
bash build.sh
```

It provisions `.venv-docs` from `requirements.txt`, fetches the imported
documentation, preprocesses it, builds the site into `site/`, downloads the
pinned Redoc bundle, writes the redirects and sitemap, and runs Pagefind to
build the search index. Expect a little over five minutes and around 17,000
files on a first run; the git mirrors under `.import-cache/` are reused
afterwards.

`requirements.txt` is fully pinned, transitive dependencies included, because
Zensical's own metadata floats most of them and an unpinned renderer changes the
site's output without a commit. To bump it, install the Zensical version you
want into a clean virtualenv and replace the file with `pip freeze`.

## Previewing locally

`build.sh` is the whole build, but it is too slow for editing prose. For a
faster loop, expand the imports once and then serve:

```bash
python3 scripts/expand_imports.py
python3 scripts/preprocess_docs.py
.venv-docs/bin/zensical serve -f mkdocs.gen.yml
```

`expand_imports.py` clones each source repository listed in the `nav` section of
`mkdocs.yml` into `.import-cache/`, copies its documentation into `build/docs/`,
and writes `mkdocs.gen.yml` with every `!import` replaced by the imported
navigation. Re-run it whenever `mkdocs.yml` changes or you want to pick up new
upstream commits.

`preprocess_docs.py` then rewrites that staged tree in place, and is not
optional: skip it and every imported GitHub alert renders as a literal
`[!NOTE]` blockquote and every API reference page comes out empty. It converts
GitHub and GitLab alerts into Material admonitions, replaces `<redoc>` tags with
an iframe and a companion page, and strips dotfiles the imported sources ship.
Both of those jobs used to be MkDocs plugins, `gh-admonitions` and `redoc-tag`,
which Zensical cannot load.

Two caveats when serving this way. The API reference pages will be blank,
because the Redoc bundle is downloaded by `build.sh` into `site/` rather than
committed; and the redirects, search exclusions and sitemap come from
`postprocess_site.py`, which also only runs in the full build.

## Adding External Versioned Docsets

External documentation repositories are imported by `scripts/expand_imports.py`.
For versioned docsets (products with multiple versions), follow these steps:

### 1. Add to Navigation (`mkdocs.yml`)

Add the docset to the `nav` section with version imports, newest first. Nothing
in the build compares version numbers, so that ordering is what makes the
redirect target correct: it is the first version listed that is neither a
pre-release (a title containing "alpha", "beta" or "rc") nor "Development",
falling back to the first pre-release for a docset that has yet to ship a
release, and to "Development" for one that has nothing else:

```yaml
nav:
  # ... existing nav items ...

  - My Product:
    - v1.2.0: '!import https://github.com/pgEdge/my-product?branch=v1.2.0'
    - v1.1.0: '!import https://github.com/pgEdge/my-product?branch=v1.1.0'
    - Development: '!import https://github.com/pgEdge/my-product?branch=main'
```

The nav title ("My Product") will be converted to a URL slug (`my-product`).

### 2. Add to Versioned Docsets List (`mkdocs.yml`)

Add the URL slug to `extra.versioned_docsets`. This enables automatic redirect
generation for `/my-product/` → `/my-product/v1-2-0/`:

```yaml
extra:
  versioned_docsets:
    # ... existing docsets ...
    - my-product
```

### 3. Add to Navigation Categories (`mkdocs.yml`)

If the docset should appear in the navigation dropdown menus, add it to the
appropriate category in `extra.nav_categories`:

```yaml
extra:
  nav_categories:
    Tools:
      # ... existing items ...
      - title: My Product
        url: my-product/
```

### How It Works

- **`scripts/expand_imports.py`**: Fetches each `!import` source at its pinned
  ref, copies its `docs/` tree into `build/docs/<docset>/<version>/`, splices the
  imported repository's own nav into the parent nav, writes a redirect stub at
  `<docset>/index.md` for each entry in `versioned_docsets`, and writes
  `mkdocs.gen.yml`
- **`scripts/preprocess_docs.py`**: Before the build, rewrites the staged tree:
  GitHub and GitLab alerts become Material admonitions, `<redoc>` tags become an
  iframe plus a companion page loading the pinned Redoc bundle, and dotfiles the
  imported sources ship are removed. Replaces the `gh-admonitions` and
  `redoc-tag` MkDocs plugins, which Zensical cannot load. Fails the build if
  either conversion matches nothing, since the imports are pinned to tags and
  zero matches means a regression rather than a change upstream
- **`scripts/postprocess_site.py`**: After the build, writes the Cloudflare
  `_redirects` file, marks non-latest versions as excluded from the search
  index, and regenerates `sitemap.xml` from the built tree. Runs before Pagefind,
  which reads those exclusions. The sitemap is rebuilt rather than taken from the
  engine because Zensical lists only pages the nav reaches, which would drop the
  docset root stubs and every unlinked page
- **`overrides/redirect.html`**: Template that dynamically determines the latest
  version from the nav structure and generates a JavaScript/meta refresh redirect
- **`overrides/404.html`**: Handles legacy URLs without version numbers by
  redirecting to the latest version (e.g., `/ace/overview/` → `/ace/v1-5-1/overview/`)