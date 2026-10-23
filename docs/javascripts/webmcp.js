// WebMCP tools: three read-only tools a browser agent can call on any docs
// page (search, read a page, site overview) instead of reading the HTML.
// Registered only where the browser exposes document.modelContext, so other
// visitors see no change.
// See https://webmachinelearning.github.io/webmcp/
(function() {
    'use strict';

    if (!('modelContext' in document)) return;

    var SEARCH_LIMIT = 10;

    async function fetchText(url) {
        var response = await fetch(url);
        if (!response.ok) throw new Error(url + ' returned ' + response.status);
        return response.text();
    }

    // A page's markdown text. Expected failures come back as a sentence an
    // agent can act on; anything else throws.
    async function fetchMarkdown(url, pageUrl) {
        var response = await fetch(url);
        if (response.status === 404) {
            return 'No markdown version exists for ' + url.href + '.';
        }
        if (response.status === 429 || response.status >= 500) {
            return 'This page is temporarily unavailable.' + (pageUrl ?
                ' It can still be read as HTML at ' + pageUrl.href + '.' : '');
        }
        if (!response.ok) throw new Error(url + ' returned ' + response.status);
        return response.text();
    }

    // Where a page's meta refresh points, if it is a redirect.
    function refreshTarget(html, base) {
        var refresh = html.querySelector('meta[http-equiv="refresh"]');
        var target = refresh && /url=(.+)$/i.exec(refresh.content);
        return target ? new URL(target[1].trim(), base) : null;
    }

    // A page's markdown: a .md URL directly, or the text/markdown alternate
    // link of an HTML page, following a docset root's redirect to its latest
    // version.
    async function pageMarkdown(input, redirects) {
        var url = new URL(input, location.origin);
        if (url.origin !== location.origin) {
            return 'Only pages on ' + location.origin + ' can be read.';
        }
        if (url.pathname.endsWith('.md')) return fetchMarkdown(url);

        var html = new DOMParser().parseFromString(await fetchText(url),
                                                   'text/html');
        var link = html.querySelector(
            'link[rel="alternate"][type="text/markdown"]');
        if (link) {
            return fetchMarkdown(new URL(link.getAttribute('href'), url), url);
        }

        var target = refreshTarget(html, url);
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
            var excerpt = page.excerpt.replace(/<[^>]+>/g, '');
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
        document.modelContext.registerTool(tool).catch(function(error) {
            console.warn('WebMCP: could not register ' + tool.name, error);
        });
    });
})();
