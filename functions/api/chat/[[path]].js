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
    // Build the target URL
    let targetUrl;
    if (path.startsWith('v1/')) {
      // Direct API path (e.g., v1/health, v1/pipelines/...)
      targetUrl = `${RAG_INTERNAL_URL}/${path}`;
    } else {
      // Default to pipeline endpoint
      targetUrl = `${RAG_INTERNAL_URL}/v1/pipelines/${PIPELINE_NAME}`;
    }

    // Forward the request
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
    headers.set('Accept', request.headers.get('Accept') || 'text/event-stream');

    if (RAG_SECRET) {
      headers.set('X-Internal-Secret', RAG_SECRET);
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? request.body : undefined,
    });

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
