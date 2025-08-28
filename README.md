# pgEdge Documentation

__WARNING: This is a v2.0 Work In Progress. See the pgedge-docs-sandbox repo 
for the current docs.__

This repository contains the core pgEdge product documentation and 
infrastructure for generating the docs website. It is based on 
[MkDocs](https://www.mkdocs.org), using the 
[Material theme](https://squidfunk.github.io/mkdocs-material/), along with the
[multirepo plugin](https://github.com/jdoiro3/mkdocs-multirepo-plugin) which
allows docs from other repositories to be merged into the site.

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

4) Run the local MkDocs server for testing:
    ```bash
    mkdocs serve
    INFO    -  Building documentation...
    INFO    -  Multirepo plugin importing docs...
    INFO    -  Cleaning site directory
    INFO    -  Multirepo plugin is cleaning up temp_dir/
    INFO    -  Documentation built in 0.18 seconds
    INFO    -  [14:32:14] Watching paths for changes: 'docs', 'mkdocs.yml'
    INFO    -  [14:32:14] Serving on http://127.0.0.1:8000/
    ```