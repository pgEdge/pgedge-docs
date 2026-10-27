// WebMCP tools: three read-only tools a browser agent can call on any docs
// page (search, read a page, site overview) instead of reading the HTML.
// Registered only where the browser exposes document.modelContext, so other
// visitors see no change.
// See https://webmachinelearning.github.io/webmcp/
(function() {
    'use strict';

    if (!('modelContext' in document)) return;

    var SEARCH_LIMIT = 10;
    var PRODUCTION_ORIGIN = 'https://docs.pgedge.com';

    async function fetchText(url) {
        var response = await fetch(url);
        if (!response.ok) throw new Error(url + ' returned ' + response.status);
        return response.text();
    }

    // Fetch a page's text, with the URL it ended on after redirects.
    // Expected failures resolve to {sentence}, one an agent can act on;
    // other failures throw.
    async function fetchOrExplain(url, pageUrl, missing) {
        var offSite = { sentence: 'Only pages on ' + location.origin +
            ' can be read.' };
        // Checked here, not by callers, because links read out of fetched
        // pages reach this too.
        if (url.origin !== location.origin) return offSite;
        // nosemgrep: rules_lgpl_javascript_ssrf_rule-node-ssrf
        var response = await fetch(url);
        // fetch follows redirects, so check where the response ended too.
        if (response.url && new URL(response.url).origin !== location.origin) {
            return offSite;
        }
        if (response.status === 404) return { sentence: missing };
        if (response.status === 429 || response.status >= 500) {
            return { sentence: 'This page is temporarily unavailable.' +
                (pageUrl ? ' It can still be read as HTML at ' +
                 pageUrl.href + '.' : '') };
        }
        if (!response.ok) throw new Error(url + ' returned ' + response.status);
        return { text: await response.text(), url: response.url };
    }

    async function fetchMarkdown(url, pageUrl) {
        var result = await fetchOrExplain(
            url, pageUrl, 'No markdown version exists for ' + url.href + '.');
        return result.sentence || result.text;
    }

    // Where a page's meta refresh points, if it is a redirect.
    function refreshTarget(doc, base) {
        var refresh = doc.querySelector('meta[http-equiv="refresh"]');
        var target = refresh && /url=(.+)$/i.exec(refresh.content);
        return target ? new URL(target[1].trim(), base) : null;
    }

    // An agent's URL or path as a URL, or null if it is not one.
    function resolveInput(input) {
        var url;
        try {
            url = new URL(input, location.origin);
        } catch (error) {
            return null;
        }
        // llms.txt links to production, so read those links from here.
        if (url.origin === PRODUCTION_ORIGIN) {
            url = new URL(url.pathname + url.search + url.hash,
                          location.origin);
        }
        return url;
    }

    // A page's markdown: a .md URL directly, or the text/markdown alternate
    // link of an HTML page, following a docset root's redirect to its latest
    // version.
    async function pageMarkdown(input, redirects) {
        var url = resolveInput(input);
        if (!url) return 'Not a valid URL or path.';
        if (url.pathname.endsWith('.md')) {
            var htmlPath = url.pathname.replace(/(^|\/)(index|README)\.md$/,
                                                '$1').replace(/\.md$/, '/');
            return fetchMarkdown(url, new URL(htmlPath, url));
        }
        return htmlPageMarkdown(url, redirects);
    }

    async function htmlPageMarkdown(url, redirects) {
        var page = await fetchOrExplain(
            url, null, 'No page exists at ' + url.href + '.');
        if (page.sentence) return page.sentence;
        var doc = new DOMParser().parseFromString(page.text, 'text/html');
        // Relative links resolve against the URL fetch ended on, which
        // differs from the one asked for after a trailing-slash redirect.
        var base = new URL(page.url);
        var link = doc.querySelector(
            'link[rel="alternate"][type="text/markdown"]');
        if (link) {
            return fetchMarkdown(new URL(link.getAttribute('href'), base), base);
        }

        var target = refreshTarget(doc, base);
        if (target && !redirects) return pageMarkdown(target, 1);
        return 'No markdown version exists for ' + url.href + '.';
    }

    async function searchDocs(query) {
        var pagefind = await import('/pagefind/pagefind.js');
        var search = await pagefind.search(query);
        var results = await Promise.all(
            search.results.slice(0, SEARCH_LIMIT).map(function(r) {
                return r.data();
            }));
        if (!results.length) return 'No pages match "' + query + '".';
        return results.map(function(page) {
            // The excerpt is HTML with <mark> around the matches; parsing it
            // drops the tags and decodes every entity.
            var excerpt = new DOMParser().parseFromString(
                page.excerpt, 'text/html').body.textContent;
            return '- [' + page.meta.title + '](' +
                new URL(page.url, location.origin).href + '): ' + excerpt;
        }).join('\n');
    }

    var tools = [
        {
            name: 'search_docs',
            description: 'Search the pgEdge documentation and return the ' +
                'best-matching pages, with a link and an excerpt for each. ' +
                'Pass a result\'s link to read_page to read the full page.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'What to search for' }
                },
                required: ['query']
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute: function(input) { return searchDocs(input.query); }
        },
        {
            name: 'read_page',
            description: 'Return a pgEdge documentation page as markdown. ' +
                'Accepts a page URL or path on this site, such as a ' +
                'link returned by search_docs or get_site_overview.',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'Page URL or path' }
                },
                required: ['url']
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute: function(input) { return pageMarkdown(input.url, 0); }
        },
        {
            name: 'get_site_overview',
            description: 'Return an overview of what pgEdge offers: every ' +
                'product, with a link to its latest docs. Start here ' +
                'when unsure which product applies, then use ' +
                'search_docs or read_page.',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: true },
            execute: function() { return fetchText('/llms.txt'); }
        }
    ];

    tools.forEach(function(tool) {
        Promise.resolve().then(function() {
            return document.modelContext.registerTool(tool);
        }).catch(function(error) {
            console.warn('WebMCP: could not register ' + tool.name, error);
        });
    });
})();
