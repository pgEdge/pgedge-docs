# pgEdge Documentation

This repository contains the core pgEdge product documentation and 
infrastructure for generating the docs website. It is based on 
[MkDocs](https://www.mkdocs.org), using the 
[Material theme](https://squidfunk.github.io/mkdocs-material/), along with
`scripts/expand_imports.py`, which merges docs from other repositories into the
site.

## Build Status

[![Build Docs](https://github.com/pgEdge/pgedge-docs/actions/workflows/build-docs.yml/badge.svg)](https://github.com/pgEdge/pgedge-docs/actions/workflows/build-docs.yml)

## Setup

1) Create a Python virtual environment:
    ```bash
    python3 -m venv pgedge-docs-venv
    ```

2) Activate the virtual environment:
    ```bash
    source pgedge-docs-venv/bin/activate
    ```

3) Check out the source tree, and install the required Python modules:
    ```bash
    git clone https://github.com/pgEdge/pgedge-docs
    cd pgedge-docs
    pip install -r requirements.txt
    ```

4) Fetch the external documentation and generate the expanded configuration:
    ```bash
    python3 scripts/expand_imports.py
    Fetching 21 repositories...
    Importing 128 versions...
    Wrote mkdocs.gen.yml (128 imports expanded into build/docs)
    ```

    This clones each source repository listed in the `nav` section of
    `mkdocs.yml` into `.import-cache/`, copies its documentation into
    `build/docs/`, and writes `mkdocs.gen.yml` with every `!import` replaced by
    the imported navigation. Re-run it whenever `mkdocs.yml` changes or you want
    to pick up new upstream commits; the mirrors are reused between runs.

5) Run the local MkDocs server for testing:
    ```bash
    mkdocs serve -f mkdocs.gen.yml
    INFO    -  Building documentation...
    INFO    -  Documentation built in 0.18 seconds
    INFO    -  [14:32:14] Watching paths for changes: 'build/docs', 'mkdocs.gen.yml'
    INFO    -  [14:32:14] Serving on http://127.0.0.1:8000/
    ```

## Adding External Versioned Docsets

External documentation repositories are imported by `scripts/expand_imports.py`.
For versioned docsets (products with multiple versions), follow these steps:

### 1. Add to Navigation (`mkdocs.yml`)

Add the docset to the `nav` section with version imports, newest first. Nothing
in the build compares version numbers, so that ordering is what makes the
redirect target correct: it is the first version listed that is neither a
pre-release (any version whose title contains "alpha", "beta" or "rc") nor
"Development", falling back to the first pre-release for a docset that has yet
to ship a release, and to "Development" for one that has nothing else:

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
- **`scripts/postprocess_site.py`**: After the build, writes the Cloudflare
  `_redirects` file and marks non-latest versions as excluded from the search
  index. Runs before Pagefind, which reads those exclusions
- **`overrides/redirect.html`**: Template that dynamically determines the latest
  version from the nav structure and generates a JavaScript/meta refresh redirect
- **`overrides/404.html`**: Handles legacy URLs without version numbers by
  redirecting to the latest version (e.g., `/ace/overview/` → `/ace/v1-5-1/overview/`)