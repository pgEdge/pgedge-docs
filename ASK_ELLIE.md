# Ask Ellie - AI Chat Interface

Ask Ellie is an AI-powered chat assistant integrated into the pgEdge documentation site. It uses a RAG (Retrieval-Augmented Generation) server to provide accurate answers based on the documentation content.

## Overview

The chat interface consists of:

- **Frontend**: A floating chat widget (`docs/javascripts/chat.js` and `docs/stylesheets/chat.css`)
- **Backend**: The [pgEdge RAG Server](https://github.com/pgEdge/pgedge-rag-server) providing semantic search and LLM-powered responses
- **Infrastructure**: Ansible-managed RAG server with Cloudflare Pages Functions and Tunnel

## Architecture

### Production Setup (Cloudflare Pages + Tunnel)

The production deployment uses Cloudflare Pages Functions and Tunnel to keep the RAG server private:

```text
┌─────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Browser   │────▶│  Pages Function     │────▶│  Cloudflare Tunnel  │
│             │     │  (functions/api/)   │     │  (cloudflared)      │
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
- Pages Function deploys automatically with the documentation site
- Works for all preview deployments without configuration
- No separate worker management needed

### Simple Setup (Direct Connection)

For development or simpler deployments, the browser can connect directly with CORS enabled:

```text
┌─────────────┐                    ┌─────────────────────┐
│   Browser   │───────────────────▶│     RAG Server      │
│             │      HTTPS         │  (with CORS enabled)│
└─────────────┘                    └─────────────────────┘
```

## Frontend Configuration

The chat widget is configured in `docs/javascripts/chat.js`:

```javascript
const CONFIG = {
    api: {
        production: '/api/chat',              // Production endpoint (via Pages Function)
        development: 'http://localhost:8080', // Local RAG server
        pipelineName: 'pgedge-docs',          // RAG pipeline name
        timeout: 60000,                       // Request timeout (ms)
        healthCheckTimeout: 3000              // Health check timeout (ms)
    },
    compaction: {
        maxTokens: 15000,        // Maximum tokens before compaction
        maxMessages: 15,         // Maximum messages before compaction
        recentWindow: 4,         // Recent messages always kept
        minImportantMessages: 3  // Minimum important messages to keep
    },
    // ...
};
```

### Key Features

- **Health Check**: The FAB (Floating Action Button) only appears if the RAG server is accessible
- **Streaming Responses**: Uses Server-Sent Events (SSE) for real-time response streaming
- **Conversation History**: Persisted in localStorage with automatic compaction
- **Context Management**: Automatic conversation compaction to stay within token limits while preserving important context
- **Input History**: Navigate previous inputs with Up/Down arrow keys
- **Resizable Window**: Drag from top-left corner to resize; size is remembered
- **Theme Support**: Adapts to light/dark mode via CSS variables
- **Markdown Rendering**: Supports headings, lists, code blocks, bold, italic, and links

## Ansible Deployment

The production infrastructure is managed by Ansible in the `ansible/` directory.

### Deploy Everything

```bash
cd ansible
ansible-playbook playbooks/site.yml
```

### Deploy Specific Components

```bash
# RAG Server only
ansible-playbook playbooks/site.yml --tags rag_server

# Cloudflare Tunnel only
ansible-playbook playbooks/site.yml --tags cloudflared

# Documentation loader
ansible-playbook playbooks/site.yml --tags docloader
```

Note: The chat API proxy is handled by Cloudflare Pages Functions (`functions/api/chat/`)
which deploy automatically with the documentation site.

### Configuration Files

| File | Purpose |
|------|---------|
| `ansible/inventory/group_vars/all/main.yml` | Main configuration (system prompt, etc.) |
| `ansible/inventory/group_vars/all/vault.yml` | Encrypted secrets |
| `ansible/roles/rag_server/templates/config.yaml.j2` | RAG server config |
| `functions/api/chat/[[path]].js` | Pages Function for API proxy |

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

    # Retrieval settings
    token_budget: 8000  # Maximum tokens for context
    top_n: 20           # Number of chunks to retrieve

    system_prompt: |
      You are Ellie, a friendly database expert working at pgEdge.
      Answer questions based on the documentation provided.
      Be concise, helpful, and warm.
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

## API Reference

### Health Check

```http
GET /v1/health
```

Returns `200 OK` if the server is healthy.

### Query Pipeline

```http
POST /v1/pipelines/{pipeline_name}
Content-Type: application/json

{
  "query": "How do I install pgEdge?",
  "stream": true,
  "messages": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ]
}
```

**Response (SSE stream):**

```text
data: {"type": "chunk", "content": "To install pgEdge, "}
data: {"type": "chunk", "content": "you can use..."}
data: {"type": "done"}
```

**Non-streaming response** (`"stream": false`):

```json
{
  "response": "To install pgEdge, you can use...",
  "sources": [...]
}
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

### System Prompt

The production system prompt is configured in `ansible/inventory/group_vars/all/main.yml` under `rag_server.pipelines[0].system_prompt`. Key elements include:

- Ellie's personality and interests (elephants, turtles, databases)
- Conversational style guidelines (only greet on first message)
- Product recommendation rules
- Guardrails for team/people information

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
| `ansible/` | Infrastructure deployment |
| `ASK_ELLIE.md` | This documentation |
