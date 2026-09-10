#!/usr/bin/env python3
"""Pre-process the staged documentation tree, in place, before either engine
builds it.

This is the counterpart to `postprocess_site.py`, and it exists for the same
reason: work that used to be an MkDocs plugin has to keep happening once the
build stops being an MkDocs implementation detail. Zensical does not load MkDocs
plugins at all, so anything a plugin did to our content has to move somewhere
both engines share, and the staged tree that `expand_imports.py` writes to
`build/docs` is the only such place. It is generated and gitignored, so
rewriting it in place changes nothing that is committed.

Two plugins are replaced here.

1. `mkdocs-github-admonitions-plugin`, which rewrote GitHub and GitLab alert
   blockquotes (`> [!NOTE]`) into Material admonitions (`!!! note`). The
   imported sources are frozen at tags we cannot change and several of them
   write alerts, so without this they render as literal blockquotes containing
   `[!NOTE]`. The conversion below is a direct port of that plugin's logic,
   which is MIT licensed.

2. `mkdocs-redoc-tag`, which turned a `<redoc src="...">` tag into an iframe
   showing a Redoc-rendered OpenAPI specification. That plugin did its work on
   rendered HTML in `on_post_page`, writing a companion page per tag into the
   built site; this does the equivalent one step earlier, writing the companion
   page into the staged tree as a sibling of the Markdown file, where both
   engines copy it through to the site untouched along with the specifications
   themselves.

   Every URL emitted here is root-relative, and deliberately so. MkDocs does not
   rewrite `iframe[src]` whilst Zensical does, so the same relative path comes
   out of the two engines pointing at two different places; an absolute path is
   the one form neither engine touches. The site is served from the root of
   docs.pgedge.com, so this is safe, and `mkdocs.yml` already relies on it for
   `/control-plane/v0-10/scripts/generate-stack.js`.

   The Redoc bundle itself is downloaded, pinned, by `build.sh`; the redark dark
   theme it is dressed in is vendored under `docs/assets/redoc/`.
"""

import argparse
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

# --- GitHub and GitLab alerts ---------------------------------------------
#
# Ported from mkdocs-github-admonitions-plugin 0.1.1 (MIT), whose behaviour we
# are matching rather than improving on: a change in what these patterns accept
# is a change in how thirty-odd imported pages render. The one deliberate
# divergence is the `\Z` below, which lets the last line of an alert body end at
# end of file rather than requiring a trailing newline; the plugin would leave
# such an alert as a literal blockquote, which is a bug rather than a behaviour
# worth preserving.

CODEBLOCK_PATTERN = re.compile(r"^```.*?^```", flags=re.MULTILINE | re.DOTALL)

# Shared with the Redoc pass below, because either conversion can be triggered by
# a page that documents the syntax rather than using it. The inline form matches
# a run of backticks, whatever its length, up to the next run of the same length
# on the same line, which is how Markdown itself delimits a code span.
INLINE_CODE_PATTERN = re.compile(r"(?P<ticks>`+)(?:(?!(?P=ticks))[^\n])+(?P=ticks)")

ALERT_BASIC_PATTERN = re.compile(
    r"^> {,3}\[!(?P<type>note|tip|important|caution|warning)] *(?P<title>.*)\r?\n"
    r"(?P<body>(?:>.*(?:\r?\n|\Z))+)",
    flags=re.IGNORECASE | re.MULTILINE,
)
ALERT_BASIC_BODY_PREFIX = re.compile("^> ?", re.MULTILINE)

# GitLab's multiline blockquote spelling of the same thing.
ALERT_MULTILINE_PATTERN = re.compile(
    r"^>>> {,3}\[!(?P<type>note|tip|important|caution|warning)] *(?P<title>.*)\r?\n"
    r"(?P<body>(?:.*\r?\n)+)>>>",
    flags=re.IGNORECASE | re.MULTILINE,
)
ALERT_MULTILINE_BODY_PREFIX = re.compile("^", re.MULTILINE)

# GitHub's alert types do not map one-to-one onto Material's admonitions.
ADMONITION_TYPE_MAP = {
    "caution": "danger",
    "important": "warning",
}


def convert_alerts(markdown: str) -> str:
    """Rewrite GitHub/GitLab alerts as Material admonitions."""

    def convert(match: re.Match, codeblocks: list, body_prefix: re.Pattern) -> str:
        """Rewrite a single matched alert, unless it sits inside a code fence."""
        # An alert inside a fenced block is being shown, not used.
        if any(
            block.start() < match.start() and match.end() < block.end()
            for block in codeblocks
        ):
            return match.group()

        alert_type = match.group("type")
        title = match.group("title").strip()
        body = body_prefix.sub("    ", match.group("body").strip())
        admonition = ADMONITION_TYPE_MAP.get(alert_type.lower(), alert_type.lower())
        return f'!!! {admonition} "{title or alert_type.title()}"\n{body}\n'

    for pattern, prefix in (
        (ALERT_BASIC_PATTERN, ALERT_BASIC_BODY_PREFIX),
        (ALERT_MULTILINE_PATTERN, ALERT_MULTILINE_BODY_PREFIX),
    ):
        # Recomputed per pass because the first pass moves everything after it.
        codeblocks = list(CODEBLOCK_PATTERN.finditer(markdown))
        markdown = pattern.sub(lambda m: convert(m, codeblocks, prefix), markdown)

    return markdown


# --- Redoc ----------------------------------------------------------------

REDOC_TAG_PATTERN = re.compile(
    r"<redoc\b(?P<attrs>[^>]*?)/?>(?:\s*</redoc>)?",
    flags=re.IGNORECASE,
)
REDOC_SRC_PATTERN = re.compile(r"""\bsrc\s*=\s*["'](?P<src>[^"']*)["']""", re.IGNORECASE)

# Where build.sh puts the pinned Redoc bundle, and where the vendored redark
# theme lands once the engine has copied docs/assets/redoc through.
REDOC_ASSET_ROOT = "/assets/redoc"

# The iframe exists to keep Redoc's stylesheet out of the Material page around
# it; the height matches the plugin's default, which is what the current site
# renders at.
IFRAME_HEIGHT = "80vh"

COMPANION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <link rel="stylesheet" type="text/css" id="redark-css" media="none" href="{assets}/redark.css">
  <script src="{assets}/redark.js" charset="UTF-8"></script>
  <style>
    body {{ margin: 0; padding: 0; }}
  </style>
</head>
<body>
  <div id="redoc-container"></div>
  <script src="{assets}/redoc.standalone.js" charset="UTF-8"></script>
  <script>
    var openapiSpecUrl = {spec_url};

    function enable_dark_mode() {{
      document.getElementById("redark-css").media = "";
      Redoc.init(openapiSpecUrl, {{ theme: redark }},
                 document.getElementById("redoc-container"));
    }}

    function disable_dark_mode() {{
      document.getElementById("redark-css").media = "none";
      Redoc.init(openapiSpecUrl, {{}},
                 document.getElementById("redoc-container"));
    }}

    window.onload = function () {{
      // parent.scheme is published by the sync script the preprocessor injects
      // into the embedding page; absent it, light is the sensible default.
      var scheme;
      try {{
        scheme = parent.scheme;
      }} catch (e) {{
        scheme = null;
      }}
      if (scheme === "slate") {{
        enable_dark_mode();
      }} else {{
        disable_dark_mode();
      }}
    }};
  </script>
</body>
</html>
"""

# Injected once per page that embeds Redoc, rather than site-wide as the plugin
# did, so pages without an API reference carry none of it. Material's instant
# loading is switched off in mkdocs.yml, so a plain script needs no document$.
SYNC_SCRIPT = """<script>
(function () {
  var darkScheme = "slate";
  window.scheme = document.body.getAttribute("data-md-color-scheme");
  new MutationObserver(function () {
    window.scheme = document.body.getAttribute("data-md-color-scheme");
    var frames = document.getElementsByClassName("redoc-iframe");
    for (var i = 0; i < frames.length; i++) {
      var win = frames.item(i).contentWindow;
      if (!win || !win.enable_dark_mode) continue;
      if (window.scheme === darkScheme) {
        win.enable_dark_mode();
      } else {
        win.disable_dark_mode();
      }
    }
  }).observe(document.body, { attributeFilter: ["data-md-color-scheme"] });
})();
</script>"""


def resolve_spec_url(src: str, page_rel_dir: str) -> str:
    """Turn a `<redoc src>` into a URL the companion page can load.

    Absolute URLs are passed through (control-plane points at GitHub), as are
    paths that are already root-relative. Everything else is resolved against
    the Markdown file's directory in the staged tree and made root-relative.
    """
    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", src) or src.startswith("//"):
        return src
    if src.startswith("/"):
        return src
    resolved = os.path.normpath(os.path.join(page_rel_dir, src))
    return "/" + resolved.replace(os.sep, "/").lstrip("/")


def convert_redoc_tags(markdown: str, path: Path, docs_dir: Path, log) -> tuple:
    """Replace `<redoc>` tags with iframes, returning the Markdown and the
    companion pages to write alongside it."""
    if not REDOC_TAG_PATTERN.search(markdown):
        return markdown, []

    page_rel = path.relative_to(docs_dir)
    page_rel_dir = str(page_rel.parent).replace(os.sep, "/")
    if page_rel_dir == ".":
        page_rel_dir = ""

    companions = []

    # Computed once, over the Markdown the substitution below is about to scan,
    # so the offsets line up: a tag inside a fence or an inline code span is
    # being documented rather than embedded, and converting it would inject an
    # iframe into the example, write a companion page for a specification that
    # does not exist, and warn about the missing specification into the bargain.
    protected = [match.span() for match in CODEBLOCK_PATTERN.finditer(markdown)]
    protected += [match.span() for match in INLINE_CODE_PATTERN.finditer(markdown)]

    def replace(match: re.Match) -> str:
        """Swap one `<redoc>` tag for an iframe, queueing its companion page."""
        # Returning the tag untouched before anything else is done leaves both
        # the companion counter and the sync script alone, as it must.
        if any(start <= match.start() and match.end() <= end
               for start, end in protected):
            return match.group()

        src_match = REDOC_SRC_PATTERN.search(match.group("attrs"))
        if not src_match:
            log(f"WARNING: {page_rel} has a <redoc> tag with no src; leaving it alone")
            return match.group()

        src = html.unescape(src_match.group("src"))
        spec_url = resolve_spec_url(src, page_rel_dir)

        # A local specification that is not in the staged tree will not be in
        # the site either, and the iframe would render an error nobody sees.
        if spec_url.startswith("/") and not (docs_dir / spec_url.lstrip("/")).exists():
            log(f"WARNING: {page_rel} references '{src}', which is not in the "
                f"staged tree; the API reference will be empty")

        # Deterministic, not the plugin's random UUID: the same input has to
        # produce the same site under both engines for the two to be diffable.
        name = f"redoc-{path.stem}-{len(companions) + 1}.html"
        companions.append((path.parent / name, COMPANION_TEMPLATE.format(
            title=f"{path.stem} API reference",
            assets=REDOC_ASSET_ROOT,
            # The URL lands in a JavaScript string literal inside a <script>
            # block, where HTML entities are not decoded, so escaping it as
            # HTML would break any specification URL containing an ampersand.
            # json.dumps emits the surrounding quotes itself, and the template
            # therefore does not add its own.
            spec_url=json.dumps(spec_url),
        )))

        iframe_url = f"/{page_rel_dir}/{name}" if page_rel_dir else f"/{name}"
        return (
            f'<iframe class="redoc-iframe" src="{iframe_url}" width="100%" '
            f'frameborder="0" style="overflow:hidden;width:100%;'
            f'height:{IFRAME_HEIGHT};"></iframe>'
        )

    markdown = REDOC_TAG_PATTERN.sub(replace, markdown)
    if companions:
        markdown = markdown.rstrip("\n") + "\n\n" + SYNC_SCRIPT + "\n"
    return markdown, companions


# --- Driver ---------------------------------------------------------------


def log(message: str) -> None:
    """Print a progress or warning line, tagged with the script name."""
    print(f"preprocess_docs.py: {message}")


def remove_dotfiles(docs_dir: Path) -> int:
    """Delete dotfiles and dot-directories from the staged tree.

    MkDocs ignored anything whose name begins with a dot, whereas Zensical
    copies it straight through into the built site, so files an imported source
    never meant to publish would start appearing on docs.pgedge.com. What is in
    the tree today is innocuous, being a handful of `.gitignore` files and the
    `.claude` directories the control-plane repository carries, but the same
    path would happily publish a `.env` the day an import picks one up.

    Whole dot-directories go as well as individual dotfiles, which is safe
    because nothing we publish can live under a path segment beginning with a
    dot: MkDocs never built such a page, so no navigation entry, link or asset
    reference in the site can point into one. The count returned is of files
    removed, directories included, since that is the figure worth reporting.
    """
    removed = 0
    for path in sorted(docs_dir.rglob(".*")):
        if not path.exists():
            # Already taken with the dot-directory that contained it.
            continue
        if path.is_dir():
            removed += sum(1 for child in path.rglob("*") if child.is_file())
            shutil.rmtree(path)
        else:
            removed += 1
            path.unlink()
    return removed


def process_page(path: Path, docs_dir: Path) -> tuple:
    """Convert one staged Markdown file in place.

    Returns a `(alerts_converted, companions_written)` pair of counts, both
    zero where the page needed no work; the file is only rewritten when the
    conversions actually changed it.
    """
    # Read as utf-8-sig, as MkDocs itself did, so that a byte order mark does
    # not sit in front of the first line and stop an alert there from matching;
    # written back as plain utf-8, so the mark is not reintroduced.
    original = path.read_text(encoding="utf-8-sig")

    converted = convert_alerts(original)
    alerts_converted = int(converted != original)

    converted, companions = convert_redoc_tags(converted, path, docs_dir, log)
    for companion_path, companion_html in companions:
        companion_path.write_text(companion_html, encoding="utf-8")

    if converted != original:
        path.write_text(converted, encoding="utf-8")

    return alerts_converted, len(companions)


def main() -> int:
    """Walk the staged tree, converting alerts and Redoc tags on every page."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docs", default="build/docs",
                        help="the staged tree written by expand_imports.py")
    args = parser.parse_args()

    docs_dir = Path(args.docs)
    if not docs_dir.is_dir():
        log(f"ERROR: {docs_dir} does not exist; run expand_imports.py first")
        return 1

    alert_pages = 0
    redoc_pages = 0
    companion_count = 0

    for path in sorted(docs_dir.rglob("*.md")):
        alerts, companions = process_page(path, docs_dir)
        alert_pages += alerts
        redoc_pages += bool(companions)
        companion_count += companions

    log(f"converted GitHub alerts on {alert_pages} pages")
    log(f"embedded Redoc on {redoc_pages} pages ({companion_count} specifications)")

    log(f"removed {remove_dotfiles(docs_dir)} imported dotfiles from the staged tree")

    # Both figures were non-zero when this replaced the plugins, and a drop to
    # zero means the imports changed shape rather than that the work is done.
    # Since the imported sources are pinned to git tags, they cannot have
    # changed under us, so the likelier explanation by far is a regression in
    # this script; failing here is much cheaper than publishing thirty pages of
    # literal `[!NOTE]` blockquotes and a set of empty API references.
    if alert_pages == 0 or redoc_pages == 0:
        log("ERROR: one of the two conversions matched nothing at all, which "
            "previously never happened; check whether this script has regressed, "
            "or whether the imported sources have changed how they write alerts "
            "or embed OpenAPI specifications")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
