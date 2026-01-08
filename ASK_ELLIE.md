# Ask Ellie - AI Chat Interface

Ask Ellie is an AI-powered chat assistant integrated into the pgEdge documentation site. It uses a RAG (Retrieval-Augmented Generation) server to provide accurate answers based on the documentation content.

## Overview

The chat interface consists of:

- **Frontend**: A floating chat widget (`docs/javascripts/chat.js` and `docs/stylesheets/chat.css`)
- **Backend**: The [pgEdge RAG Server](https://github.com/pgEdge/pgedge-rag-server) providing semantic search and LLM-powered responses

## Architecture

### Simple Setup (Direct Connection)

With CORS enabled on the RAG server, the browser can connect directly:

```
┌─────────────┐                    ┌─────────────────────┐
│   Browser   │───────────────────▶│     RAG Server      │
│             │      HTTPS         │  (with CORS enabled)│
└─────────────┘                    └─────────────────────┘
```

This is the simplest deployment option:
- The RAG server is exposed via HTTPS (e.g., behind a load balancer or reverse proxy)
- CORS is configured to allow requests from the docs domain
- The chat widget connects directly to the RAG server URL

### Enhanced Security Setup (Cloudflare Tunnel)

For additional security, you can use a Cloudflare Worker and Tunnel to avoid exposing the RAG server directly:

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Browser   │────▶│  Cloudflare Worker  │────▶│  Cloudflare Tunnel  │
│             │     │  (API Gateway)      │     │  (cloudflared)      │
└─────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                           │
                                                           ▼
                                               ┌─────────────────────┐
                                               │     RAG Server      │
                                               │  (localhost only)   │
                                               └─────────────────────┘
```

Benefits of this approach:
- RAG server binds only to localhost - no public exposure
- Worker can add origin validation, rate limiting, and authentication
- Centralized security controls via Cloudflare

## Frontend Configuration

The chat widget is configured in `docs/javascripts/chat.js`:

```javascript
const CONFIG = {
    api: {
        production: '/api/chat',              // Production endpoint
        development: 'http://localhost:8080', // Local RAG server
        pipelineName: 'pgedge-docs',          // RAG pipeline name
        timeout: 60000,                       // Request timeout (ms)
        healthCheckTimeout: 3000              // Health check timeout (ms)
    },
    // ...
};
```

### Key Features

- **Health Check**: The FAB (Floating Action Button) only appears if the RAG server is accessible
- **Streaming Responses**: Uses Server-Sent Events (SSE) for real-time response streaming
- **Conversation History**: Persisted in localStorage with automatic compaction
- **Input History**: Navigate previous inputs with Up/Down arrow keys
- **Resizable Window**: Drag from top-left corner to resize; size is remembered
- **Theme Support**: Adapts to light/dark mode via CSS variables
- **Markdown Rendering**: Supports headings, lists, code blocks, bold, italic, and links

## Development Setup

### 1. Build and Start the RAG Server

Clone and build the pgEdge RAG Server:

```bash
git clone https://github.com/pgEdge/pgedge-rag-server
cd pgedge-rag-server

# Build the server
make

# Create configuration (see example below)
cp config.example.yaml config.yaml
# Edit config.yaml with your settings

# Run the server
./bin/pgedge-rag-server --config config.yaml
```

### 2. Example RAG Server Configuration

Create a `config.yaml` file for local development:

```yaml
# pgEdge RAG Server Configuration

server:
  listen_address: "0.0.0.0"
  port: 8080
  cors:
    enabled: true
    allowed_origins:
      - "*"

pipelines:
  - name: "pgedge-docs"
    description: "pgEdge documentation search"

    database:
      host: "localhost"
      database: "docloader"

    tables:
      - table: "public.product_docs_content_chunks"
        text_column: "content"
        vector_column: "embedding"
      - table: "public.product_docs_title_chunks"
        text_column: "content"
        vector_column: "embedding"

    embedding_llm:
      provider: "openai"
      model: "text-embedding-3-small"

    rag_llm:
      provider: "anthropic"
      model: "claude-sonnet-4-20250514"

    system_prompt: |
      You are a helpful assistant called Ellie that answers questions based on
      the documentation for pgEdge products, PostgreSQL, and PostgreSQL tools,
      utilities, and extensions supported by pgEdge.

      Answer the question using only the information from the documentation.
      If the documentation doesn't contain enough information to answer, say so.
      Be concise and accurate in your responses.

      When referencing source material, say "based on the documentation" rather
      than "based on the context provided".
```

### 3. API Keys

Place API keys in the default locations or specify paths in the config:

```bash
# Default locations
~/.config/pgedge/keys/openai.key
~/.config/pgedge/keys/anthropic.key
```

### 4. Start the Docs Server

```bash
cd pgedge-docs
source pgedge-docs-venv/bin/activate
mkdocs serve
```

Open `http://127.0.0.1:8000` - the chat FAB should appear in the bottom-right corner.

### 5. CORS Configuration

For local development, ensure the RAG server has CORS enabled:

```yaml
server:
  cors:
    enabled: true
    allowed_origins:
      - "*"  # Or specifically: "http://127.0.0.1:8000", "http://localhost:8000"
```

## Production Setup

### Option 1: Direct Connection (Simple)

If the RAG server can be exposed via HTTPS:

1. Deploy the RAG server behind HTTPS (load balancer, nginx, etc.)
2. Configure CORS to allow your docs domain:

```yaml
server:
  listen_address: "0.0.0.0"
  port: 8080
  cors:
    enabled: true
    allowed_origins:
      - "https://docs.pgedge.com"
```

3. Update the frontend configuration to point to the RAG server URL:

```javascript
api: {
    production: 'https://rag.pgedge.com',  // Direct RAG server URL
    // ...
}
```

### Option 2: Cloudflare Worker + Tunnel (Enhanced Security)

For environments where the RAG server should not be directly exposed:

#### 1. Install Cloudflare Tunnel

On the server running the RAG server:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create pgedge-rag

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: <tunnel-id>
credentials-file: /home/ubuntu/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: rag-internal.pgedge.com
    service: http://localhost:8080
  - service: http_status:404
EOF

# Run as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

#### 2. Create Cloudflare Worker

Create a Worker to proxy requests from the docs site to the tunnel:

```javascript
// Cloudflare Worker: chat-api-proxy

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://docs.pgedge.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validate origin
    const origin = request.headers.get('Origin');
    if (origin !== 'https://docs.pgedge.com') {
      return new Response('Forbidden', { status: 403 });
    }

    // Forward to RAG server via tunnel
    const url = new URL(request.url);
    const ragUrl = `https://rag-internal.pgedge.com${url.pathname.replace('/api/chat', '')}/v1/pipelines/pgedge-docs`;

    const response = await fetch(ragUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': env.RAG_SECRET,
      },
      body: request.body,
    });

    // Return response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', 'https://docs.pgedge.com');
    return newResponse;
  },
};
```

#### 3. Worker Configuration

In the Cloudflare dashboard:

1. Create the Worker with the script above
2. Add environment variable: `RAG_SECRET` = (shared secret)
3. Add route: `docs.pgedge.com/api/chat*`

#### 4. RAG Server Configuration

Configure the RAG server to only accept local connections:

```yaml
server:
  listen_address: "127.0.0.1"  # Only localhost - tunnel provides access
  port: 8080
  cors:
    enabled: false  # Not needed - Worker handles CORS
```

## API Reference

### Health Check

```
GET /v1/health
```

Returns `200 OK` if the server is healthy.

### Query Pipeline

```
POST /v1/pipelines/{pipeline_name}
Content-Type: application/json

{
  "query": "How do I install pgEdge?",
  "stream": true,
  "messages": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ],
  "include_sources": false
}
```

**Response (SSE stream):**

```
data: {"type": "chunk", "content": "To install pgEdge, "}
data: {"type": "chunk", "content": "you can use..."}
data: {"type": "done"}
```

## Customization

### Changing the Primary Color

Edit `docs/stylesheets/chat.css`:

```css
:root {
    --ellie-primary: #4589AF;
    --ellie-primary-dark: #3A7799;
}
```

### Busy Messages

Edit the `busyMessages` array in `docs/javascripts/chat.js`:

```javascript
busyMessages: [
    "Consulting the elephants...",
    "Checking replication status...",
    // Add your own themed messages
],
```

### Window Size

Default size and constraints are in the CSS and JS:

```css
:root {
    --ellie-window-width: 380px;
    --ellie-window-height: 500px;
}
```

```javascript
// In handleResizeMove()
const minWidth = 300;
const minHeight = 350;
```

## Troubleshooting

### FAB Not Appearing

1. Check browser console for errors
2. Verify RAG server is running: `curl http://localhost:8080/v1/health`
3. Check CORS configuration if running on different ports

### CORS Errors

For local development, ensure:
- RAG server has `cors.enabled: true`
- Browser is accessing via `localhost` (not `127.0.0.1`) if RAG server allows `localhost`
- Or configure `allowed_origins` to include both

### Streaming Not Working

- Verify the RAG server supports SSE
- Check that `stream: true` is in the request body
- Ensure no proxy is buffering the response

## Files

| File | Purpose |
|------|---------|
| `docs/javascripts/chat.js` | Chat widget JavaScript |
| `docs/stylesheets/chat.css` | Chat widget styles |
| `mkdocs.yml` | Includes chat.js and chat.css |
| `ASK_ELLIE.md` | This documentation |
