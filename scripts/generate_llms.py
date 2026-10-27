#!/usr/bin/env python3
"""Generate `llms.txt` for the built site.

llms.txt (https://llmstxt.org) is the index an AI agent reads to find its way
around the site. Generating it from the same configuration as the site's own
menus keeps the two in step, which a hand-written copy did not.

The prose at the top and the Resources section come from
`scripts/llms_intro.md`, which is the one part to edit by hand. The product
links come from `extra.nav_categories` in mkdocs.yml, in menu order, with each
category becoming a section. Each link points at the latest version of a
versioned docset rather than its root, because the root is a meta refresh that
an agent fetching the page will not follow. Each description is the first
sentence of the page it links to, so it changes when the page does; where
that sentence does not describe the product, a `description:` key on the menu
item replaces it. The menu template ignores the key.

Third-party documentation goes under `## Optional`, which the format reserves
for links an agent can skip when it is short of context.

Runs after the build and after postprocess_site.py, since it reads the built
pages and checks every link against them. A link that does not resolve is
dropped with a warning rather than failing the deployment over one line of an
index. Most links failing, or most descriptions vanishing, does fail it,
because that means an incomplete site or changed page markup.
"""

import argparse
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from expand_imports import load_yaml  # noqa: E402
from postprocess_site import latest_version  # noqa: E402

INTRO = Path(__file__).resolve().parent / "llms_intro.md"
SECTIONS_MARKER = "<!-- generated sections -->"

# A description is the paragraph's first sentence, cut at a word boundary only
# when that sentence runs past this many characters.
MAX_DESCRIPTION = 300

# A full stop followed by any word ends a sentence, since product names such
# as pgAdmin start lowercase, except after a single letter ("U.S.", "v.") or
# one of the abbreviations listed. Add to the list when a description comes
# out cut short.
ABBREVIATIONS = ["e.g", "i.e", "etc", "vs", "cf", "approx", "no", "fig",
                 "ver", "rev", "incl", "excl"]
SENTENCE_END = re.compile(
    r"(?<!\b[A-Za-z])"
    + "".join(rf"(?<!\b{re.escape(a)})" for a in ABBREVIATIONS)
    + r"[.!?](?=\s|$)", re.IGNORECASE)

# Matches the notice overrides/main.html shows on Labs pages.
LABS_NOTICE = ("pgEdge Labs projects are under active development. APIs and "
               "features may change without notice.")

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "source", "track", "wbr"}


def log(message):
    print(f"generate_llms: {message}")


class FirstParagraph(HTMLParser):
    """The text of the first top-level paragraph in a page's article.

    Only a <p> sitting directly in the article counts: one inside an
    admonition, a tab or a card is not the page introducing itself.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.article_depth = None
        self.capturing = False
        self.text = []
        self.result = None

    def handle_starttag(self, tag, attrs):
        if self.result is not None:
            return
        if tag in VOID_TAGS:
            return
        self.stack.append(tag)
        classes = dict(attrs).get("class") or ""
        if (tag == "article" and self.article_depth is None
                and "md-content__inner" in classes):
            self.article_depth = len(self.stack)
        elif (tag == "p" and self.article_depth is not None
              and len(self.stack) == self.article_depth + 1):
            self.capturing = True
            self.text = []
        elif tag == "code" and self.capturing:
            self.text.append("`")

    def handle_endtag(self, tag):
        if self.result is not None or tag not in self.stack:
            return
        while self.stack and self.stack.pop() != tag:
            pass
        if tag == "code" and self.capturing:
            self.text.append("`")
        if tag == "p" and self.capturing:
            self.capturing = False
            text = " ".join("".join(self.text).split())
            # A paragraph holding only badges or a logo is not an
            # introduction; keep looking.
            if len(text) >= 40:
                self.result = text

    def handle_data(self, data):
        if self.capturing:
            self.text.append(data)


def describe(page_path):
    with open(page_path, encoding="utf-8") as f:
        parser = FirstParagraph()
        parser.feed(f.read())
    return shorten(parser.result) if parser.result else None


def shorten(text):
    match = SENTENCE_END.search(text)
    if match and match.end() <= MAX_DESCRIPTION:
        return text[:match.end()]
    if len(text) <= MAX_DESCRIPTION:
        # A lone sentence ending in a colon introduces a list that is not
        # being carried over.
        return text[:-1] + "." if text.endswith(":") else text
    return text[:MAX_DESCRIPTION].rsplit(" ", 1)[0] + "…"


def resolve(url, site_dir, versioned):
    """The built path for a menu URL, moved onto the latest version.

    None for a versioned docset whose latest version cannot be found, since its
    root is only a redirect.
    """
    path = url.strip("/")
    docset = path.split("/", 1)[0]
    if docset in versioned and path == docset:
        version = latest_version(site_dir, docset)
        return f"{docset}/{version}" if version else None
    return path


def page_exists(site_dir, path):
    path = re.split(r"[#?]", path, maxsplit=1)[0].strip("/")
    full = os.path.join(site_dir, path)
    return (os.path.isfile(os.path.join(full, "index.html"))
            or (bool(path) and os.path.isfile(full)))


def entry(item, path, site_dir, base):
    description = (item.get("description")
                   or describe(os.path.join(site_dir, path, "index.html")))
    title = item["title"]
    line = f"- [{title}]({base}/{path}/)"
    return f"{line}: {description}" if description else line


def build_sections(config, site_dir, base):
    extra = config.get("extra", {})
    versioned = set(extra.get("versioned_docsets", []))
    third_party = set(extra.get("third_party_docsets", []))
    labs = set(extra.get("labs_docsets", []))

    seen = set()
    sections = []
    optional = []
    unresolved = 0
    for category, items in extra.get("nav_categories", {}).items():
        lines = []
        labs_lines = []
        for item in items:
            if "url" not in item:
                continue
            path = resolve(item["url"], site_dir, versioned)
            if path is not None and path in seen:
                continue  # the menus list some products in two categories
            seen.add(path)
            # Menu items are pages, so a fragment or a file is not accepted.
            if path is None or not os.path.isfile(
                    os.path.join(site_dir, path, "index.html")):
                log(f"WARNING: the {category} menu links {item['url']}, which "
                    f"has no built page; leaving it out")
                unresolved += 1
                continue
            line = entry(item, path, site_dir, base)
            docset = path.split("/", 1)[0]
            if docset in third_party:
                optional.append(line)
            elif docset in labs:
                labs_lines.append(line)
            else:
                lines.append(line)
        # The site shows a notice on every pgEdge Labs page; an agent reading
        # only this index needs the same warning. A section made up of Labs
        # projects gets it as a sentence, and a Labs project listed among
        # supported ones gets it on its own line.
        if labs_lines and not lines:
            lines = [LABS_NOTICE + "\n", *labs_lines]
        else:
            lines += [f"{line} (pgEdge Labs)" for line in labs_lines]
        if lines:
            sections.append(f"## {category}\n\n" + "\n".join(lines))

    return sections, optional, unresolved


def expand_intro(text, site_dir, base):
    """Fill `{site}` and `{latest:<docset>}` in the intro, and check links.

    A link that does not resolve keeps its text and loses its target, so the
    prose around it still reads.
    """
    missing = "\0missing"

    def latest(match):
        docset = match.group(1)
        version = latest_version(site_dir, docset)
        if not version:
            log(f"WARNING: llms_intro.md refers to {{latest:{docset}}}, which "
                f"has no built version; unlinking it")
            return missing
        return f"{base}/{docset}/{version}"

    def check(match):
        label, url = match.groups()
        if url.startswith(missing):
            return label
        if url.startswith(base + "/") and not page_exists(
                site_dir, url[len(base):]):
            log(f"WARNING: llms_intro.md links {url}, which is not in the "
                f"built site; unlinking it")
            return label
        return match.group(0)

    text = re.sub(r"\{latest:([\w.-]+)\}", latest, text)
    text = text.replace("{site}", base)
    return re.sub(r"\[([^\]]*)\]\(([^)]*)\)", check, text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="mkdocs.yml")
    parser.add_argument("--site", default="site")
    args = parser.parse_args()

    config = load_yaml(Path(args.config).read_text())
    base = config["site_url"].rstrip("/")

    intro = expand_intro(INTRO.read_text(encoding="utf-8"), args.site, base)
    if SECTIONS_MARKER not in intro:
        log(f"ERROR: llms_intro.md has no '{SECTIONS_MARKER}' line")
        return 1

    sections, optional, unresolved = build_sections(config, args.site, base)
    if not sections:
        log("ERROR: no product links were generated; is nav_categories empty?")
        return 1

    entries = [line for s in [*sections, "\n".join(optional)]
               for line in s.splitlines() if line.startswith("- [")]
    if unresolved > len(entries):
        log(f"ERROR: {unresolved} menu links have no built page and only "
            f"{len(entries)} do; is the site incomplete?")
        return 1
    described = sum(1 for line in entries if "): " in line)
    if described < len(entries) / 2:
        log(f"ERROR: only {described} of {len(entries)} links have a "
            f"description; has the page markup changed?")
        return 1

    body = intro.replace(SECTIONS_MARKER, "\n\n".join(sections)).rstrip()
    if optional:
        body += ("\n\n## Optional\n\n"
                 "Third-party documentation, published here for reference.\n\n"
                 + "\n".join(optional))

    out = os.path.join(args.site, "llms.txt")
    with open(out, "w", encoding="utf-8") as f:
        f.write(body + "\n")
    log(f"wrote {len(entries)} product links to {out}, {described} with a "
        f"description")
    return 0


if __name__ == "__main__":
    sys.exit(main())
