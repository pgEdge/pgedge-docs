// Cloudflare Pages Function - page markdown
// Serves /<path>.md from GitHub. See scripts/markdown_pages.py.

const SOURCES_PATH = '/_markdown/sources.json';
const CACHE_SECONDS = 600;

let sources = null;

async function loadSources(context) {
  if (!sources) {
    const url = new URL(SOURCES_PATH, context.request.url);
    const response = await context.env.ASSETS.fetch(url);
    if (!response.ok) {
      throw new Error(`${SOURCES_PATH} returned ${response.status}`);
    }
    const data = await response.json();
    // Longest first, so a prefix wins over any shorter one containing it.
    data.prefixes = Object.entries(data.prefixes)
      .sort((a, b) => b[0].length - a[0].length);
    sources = data;
  }
  return sources;
}

function rawUrl(path, data) {
  let source = data.local;
  let rest = path;
  for (const [prefix, repo] of data.prefixes) {
    if (path.startsWith(prefix + '/')) {
      source = repo;
      rest = path.slice(prefix.length + 1);
      break;
    }
  }
  const at = source.lastIndexOf('@');
  return `https://raw.githubusercontent.com/${source.slice(0, at)}/` +
    `${source.slice(at + 1)}/docs/${rest}`;
}

function pageUrl(path, origin) {
  const page = path.replace(/(^|\/)(index|README)\.md$/, '$1')
    .replace(/\.md$/, '/');
  return `${origin}/${page}`;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (!url.pathname.endsWith('.md') ||
      (request.method !== 'GET' && request.method !== 'HEAD')) {
    return context.next();
  }

  const path = url.pathname.slice(1);
  let segments;
  try {
    segments = decodeURIComponent(path).split('/');
  } catch (error) {
    segments = [''];
  }
  if (segments.some((s) => s === '..' || s === '')) {
    return new Response('Not found\n', { status: 404 });
  }

  let upstream;
  try {
    upstream = await fetch(rawUrl(path, await loadSources(context)), {
      // Only successes are worth keeping: GitHub rate-limits shared egress
      // addresses, and a cached 429 would outlast the limit by minutes.
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: {
          '200-299': CACHE_SECONDS, '404': 60, '400-403': 0, '405-599': 0,
        },
      },
    });
  } catch (error) {
    return new Response('Markdown source unavailable\n', { status: 502 });
  }
  if (upstream.status === 404) {
    return new Response('Not found\n', { status: 404 });
  }
  if (!upstream.ok) {
    return new Response('Markdown source unavailable\n', { status: 502 });
  }

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      'Access-Control-Allow-Origin': '*',
      // The HTML page is the one to index; this is the same content again.
      'Link': `<${pageUrl(path, url.origin)}>; rel="canonical"`,
      'X-Robots-Tag': 'noindex',
    },
  });
}
