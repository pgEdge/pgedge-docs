// Cloudflare Pages Function - Chat API Proxy
// Proxies requests to the RAG server via Cloudflare Tunnel
//
// Environment variables (set in Cloudflare Pages dashboard):
//   RAG_INTERNAL_URL - The cloudflared tunnel URL (e.g., https://rag.internal.example.com)
//   RAG_SECRET - Shared secret for RAG server authentication
//   PIPELINE_NAME - Pipeline name (default: pgedge-docs)

export async function onRequest(context) {
  const { request, env, params } = context;

  // Get configuration from environment
  const RAG_INTERNAL_URL = env.RAG_INTERNAL_URL;
  const RAG_SECRET = env.RAG_SECRET || '';
  const PIPELINE_NAME = env.PIPELINE_NAME || 'pgedge-docs';

  // Build the path from the catch-all parameter
  const path = params.path ? params.path.join('/') : '';

  // CORS headers - allow the requesting origin for Pages previews
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check if RAG server is configured
  if (!RAG_INTERNAL_URL) {
    return new Response(JSON.stringify({
      error: 'RAG server not configured',
      message: 'Set RAG_INTERNAL_URL environment variable in Cloudflare Pages settings',
    }), {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Build the target URL, preserving query parameters
    const requestUrl = new URL(request.url);
    const search = requestUrl.search;
    // Only the endpoints chat.js uses are forwarded. The RAG server has no
    // authentication of its own, so anything else it serves (the pipeline
    // list, token usage stats) must not be reachable through this proxy.
    const pipelinePath = `v1/pipelines/${PIPELINE_NAME}`;
    let targetPaths;
    if (request.method === 'GET' && path === 'v1/health') {
      // chat.js checks health on every page load, and /v1/health pings each
      // LLM provider, whereas /v1/live (RAG server 2.x) only reports that the
      // server is up. /v1/health is the fallback for a server without /v1/live.
      targetPaths = ['v1/live', 'v1/health'];
    } else if (request.method === 'POST' &&
               (path === pipelinePath || !path.startsWith('v1/'))) {
      // Default to pipeline endpoint
      targetPaths = [pipelinePath];
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Forward the request
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
    headers.set('Accept', request.headers.get('Accept') || 'text/event-stream');

    if (RAG_SECRET) {
      headers.set('X-Internal-Secret', RAG_SECRET);
    }

    let response;
    for (const targetPath of targetPaths) {
      response = await fetch(`${RAG_INTERNAL_URL}/${targetPath}${search}`, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' ? request.body : undefined,
      });
      if (response.status !== 404) {
        break;
      }
    }

    // Add CORS headers to response
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });

  } catch (error) {
    console.error('Error proxying to RAG server:', error);

    return new Response(JSON.stringify({
      error: 'Failed to connect to RAG server',
      message: 'Service temporarily unavailable',
    }), {
      status: 502,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}
