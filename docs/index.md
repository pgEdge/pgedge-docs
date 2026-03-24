---
hide:
  - toc
  - navigation
---

<style>
/* Hero Section */
.hero-section {
  text-align: center;
  padding: 0.5rem 0 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.25rem !important;
  margin-bottom: 0.5rem !important;
  margin-top: 0 !important;
}

.hero-tagline {
  font-size: 1.1rem;
  color: var(--md-default-fg-color--light);
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.hero-description {
  font-size: 0.9rem;
  color: var(--md-default-fg-color--lighter);
  line-height: 1.5;
  max-width: 100%;
  margin: 0 auto;
}

/* Cards Grid - 3 columns */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin: 1rem 0;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 8px;
  padding: 1.25rem;
  background: var(--md-default-bg-color);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  border-color: var(--md-accent-fg-color);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 0.75rem;
}

/* Title row with icon */
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-title-row h3 {
  margin: 0 !important;
  font-size: 1.1rem !important;
  line-height: 1.2;
}

/* ICON SIZE — Lucide icons at 56px */
.card-icon {
  width: 48px !important;
  height: 48px !important;
  flex: 0 0 48px !important;
  display: block !important;
  stroke: var(--md-default-fg-color--light);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;

  /* defeat theme/global svg sizing rules */
  max-width: none !important;
  max-height: none !important;
}

.card-description {
  color: var(--md-default-fg-color--light);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-link {
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--md-accent-fg-color);
  text-decoration: none !important;
}

.card-link:hover {
  text-decoration: underline;
}

/* Section Headers */
.section-header {
  margin: 1.5rem 0 1rem 0;
}

.section-header:first-of-type {
  margin-top: 0.5rem;
}

.section-header h2 {
  margin-bottom: 0.5rem !important;
  font-size: 1.8rem !important;
}

.section-header p {
  color: var(--md-default-fg-color--light);
  font-size: 0.95rem;
}

/* Extensions Grid - 4 columns */
.extensions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

@media (max-width: 900px) {
  .extensions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .extensions-grid {
    grid-template-columns: 1fr;
  }
}

.extension-group h3 {
  font-size: 0.85rem !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--md-default-fg-color--light);
  margin-bottom: 1rem !important;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--md-default-fg-color--lightest);
}

.extension-list {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.extension-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
  margin: 0 !important;
}

.extension-list li:last-child {
  border-bottom: none;
}

.extension-list li::before {
  display: none !important;
}

.ext-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--md-default-fg-color--light);
  margin-top: 0.15rem;
}

/* Sub-headings within extension lists */
.extension-list .ext-subheading {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--md-default-fg-color--light);
  padding: 0.6rem 0 0.2rem;
  border-bottom: none;
}

.extension-list .ext-subheading:first-child {
  padding-top: 0;
}

/* Dividers within extension lists */
.extension-list .ext-divider {
  padding: 0;
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
}

</style>

<!-- Hero Section -->
<div class="hero-section">
  <h1>Welcome to pgEdge Documentation</h1>
  <p class="hero-tagline">
    <strong>Enterprise-grade PostgreSQL for distributed data and agentic AI.</strong>
  </p>
  <p class="hero-description">
    pgEdge delivers hardened, production-grade PostgreSQL with a complete AI toolkit and a seamless path from a single database through highly available, globally distributed deployments — self-hosted, in your cloud, or fully managed.
  </p>
</div>

<!-- Getting Started -->
<div class="section-header">
  <h2>Getting Started - Choose your Deployment</h2>
</div>

<div class="cards-grid">

  <!-- VMs & Bare Metal -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>VMs &amp; Bare Metal</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
          <line x1="6" x2="6.01" y1="6" y2="6" />
          <line x1="6" x2="6.01" y1="18" y2="18" />
        </svg>
      </div>
    </div>
    <p class="card-description">Direct installs on servers.</p>
    <a href="control-plane/" class="card-link">View Documentation →</a>
  </div>

  <!-- Containers -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>Containers</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z" />
          <path d="M10 21.9V14L2.1 9.1" />
          <path d="m10 14 11.9-6.9" />
          <path d="M14 19.8v-8.1" />
          <path d="M18 17.5V9.4" />
        </svg>
      </div>
    </div>
    <p class="card-description">Helm + CloudNativePG deployments.</p>
    <a href="pgedge-container/" class="card-link">View Documentation →</a>
  </div>

  <!-- pgEdge Cloud -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>pgEdge Cloud</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      </div>
    </div>
    <p class="card-description">Fully managed PostgreSQL service.</p>
    <a href="cloud/" class="card-link">View Documentation →</a>
  </div>

</div>


<!-- Key Components -->
<div class="section-header">
  <h2>Key Components</h2>
</div>

<div class="cards-grid">

  <!-- MCP Server -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>pgEdge Postgres MCP Server</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
        </svg>
      </div>
    </div>
    <p class="card-description">Give AI agents secure, structured access to PostgreSQL.</p>
    <a href="pgedge-postgres-mcp-server/" class="card-link">View Documentation →</a>
  </div>

  <!-- Enterprise Repository -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>Enterprise Repository</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <path d="m7.5 4.27 9 5.15" />
        </svg>
      </div>
    </div>
    <p class="card-description">Hardened PostgreSQL packages.</p>
    <a href="enterprise/" class="card-link">View Documentation →</a>
  </div>

  <!-- Spock -->
  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>Spock</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m17 2 4 4-4 4" />
          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <path d="m7 22-4-4 4-4" />
          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </svg>
      </div>
    </div>
    <p class="card-description">Multi-master replication for PostgreSQL.</p>
    <a href="spock-v5/" class="card-link">View Documentation →</a>
  </div>

</div>

<!-- All Documentation -->
<div class="section-header">
  <h2>All Documentation</h2>
</div>

<div class="extensions-grid">
  <div class="extension-group">
    <h3>Deployment</h3>
    <ul class="extension-list">
      <li>
        <a href="control-plane/"><strong>Control Plane</strong></a>
        <span class="ext-desc">Declarative API for deploying and managing PostgreSQL clusters on VMs and bare metal</span>
      </li>
      <li>
        <a href="enterprise/"><strong>Enterprise Repository</strong></a>
        <span class="ext-desc">Hardened, tested PostgreSQL packages for enterprise Linux and Debian/Ubuntu</span>
      </li>
      <li>
        <a href="ansible/"><strong>Ansible</strong></a>
        <span class="ext-desc">Automated cluster deployment and configuration management with Ansible playbooks</span>
      </li>
      <li class="ext-divider"></li>
      <li>
        <a href="pgedge-container/"><strong>Containers</strong></a>
        <span class="ext-desc">Deploy pgEdge Enterprise Postgres on Kubernetes with Helm and CloudNativePG</span>
      </li>
      <li class="ext-divider"></li>
      <li>
        <a href="cloud/"><strong>pgEdge Cloud</strong></a>
        <span class="ext-desc">Fully managed, globally distributed PostgreSQL as a service</span>
      </li>
    </ul>
  </div>

  <div class="extension-group">
    <h3>AI Toolkit</h3>
    <ul class="extension-list">
      <li>
        <a href="ai-toolkit/"><strong>Overview</strong></a>
        <span class="ext-desc">Architecture guide covering agent access and RAG pipelines</span>
      </li>
      <li class="ext-divider"></li>
      <li class="ext-subheading">pgEdge Components</li>
      <li>
        <a href="pgedge-postgres-mcp-server/"><strong>MCP Server</strong></a>
        <span class="ext-desc">Connect LLMs and AI agents directly to PostgreSQL via the Model Context Protocol</span>
      </li>
      <li>
        <a href="pgedge-rag-server/"><strong>RAG Server</strong></a>
        <span class="ext-desc">High-performance retrieval-augmented generation API with hybrid vector and keyword search</span>
      </li>
      <li>
        <a href="pgedge-docloader/"><strong>Docloader</strong></a>
        <span class="ext-desc">CLI tool for loading and chunking documents into PostgreSQL for AI applications</span>
      </li>
      <li>
        <a href="pgedge-vectorizer/"><strong>Vectorizer</strong></a>
        <span class="ext-desc">Automatic document chunking and vector embedding generation inside PostgreSQL</span>
      </li>
      <li class="ext-divider"></li>
      <li class="ext-subheading">Community Components</li>
      <li>
        <a href="pg_tokenizer/"><strong>pg_tokenizer</strong></a>
        <span class="ext-desc">Tokenization and text processing for search and AI workloads</span>
      </li>
      <li>
        <a href="pg_vectorize/"><strong>pg_vectorize</strong></a>
        <span class="ext-desc">RAG-focused automated vector search pipelines for PostgreSQL</span>
      </li>
      <li>
        <a href="pgvector/"><strong>pgVector</strong></a>
        <span class="ext-desc">Open-source vector similarity search for PostgreSQL</span>
      </li>
      <li>
        <a href="vchord_bm25/"><strong>vchord_bm25</strong></a>
        <span class="ext-desc">BM25 full-text ranking algorithm for PostgreSQL</span>
      </li>
    </ul>
  </div>

  <div class="extension-group">
    <h3>Database</h3>
    <ul class="extension-list">
      <li>
        <a href="postgresql/"><strong>PostgreSQL</strong></a>
        <span class="ext-desc">Reference documentation for PostgreSQL 16, 17, and 18</span>
      </li>
      <li class="ext-divider"></li>
      <li class="ext-subheading">pgEdge Extensions</li>
      <li>
        <a href="spock-v5/"><strong>Spock</strong></a>
        <span class="ext-desc">Multi-master logical replication with conflict resolution for globally distributed clusters</span>
      </li>
      <li>
        <a href="lolor/"><strong>LOLOR</strong></a>
        <span class="ext-desc">Large object replication for handling BLOBs across distributed PostgreSQL nodes</span>
      </li>
      <li>
        <a href="snowflake/"><strong>Snowflake</strong></a>
        <span class="ext-desc">Cluster-wide unique sequence generation without node coordination</span>
      </li>
      <li>
        <a href="pgedge-vectorizer/"><strong>Vectorizer</strong></a>
        <span class="ext-desc">Automatic document chunking and vector embedding generation inside PostgreSQL</span>
      </li>
      <li class="ext-divider"></li>
      <li class="ext-subheading">Community Extensions</li>
      <li>
        <a href="pg_cron/"><strong>pg_cron</strong></a>
        <span class="ext-desc">Job scheduler for PostgreSQL, running SQL on a schedule</span>
      </li>
      <li>
        <a href="pg_stat_monitor/"><strong>pg_stat_monitor</strong></a>
        <span class="ext-desc">Query performance monitoring with histogram aggregation</span>
      </li>
      <li>
        <a href="pgaudit/"><strong>pgAudit</strong></a>
        <span class="ext-desc">Detailed session and object audit logging for PostgreSQL</span>
      </li>
      <li>
        <a href="pgmq/"><strong>pgmq</strong></a>
        <span class="ext-desc">Lightweight message queue built on PostgreSQL</span>
      </li>
      <li>
        <a href="pgvector/"><strong>pgVector</strong></a>
        <span class="ext-desc">Open-source vector similarity search for PostgreSQL</span>
      </li>
      <li>
        <a href="pldebugger/"><strong>pldebugger</strong></a>
        <span class="ext-desc">Interactive debugger for PL/pgSQL functions</span>
      </li>
      <li>
        <a href="postgis/"><strong>PostGIS</strong></a>
        <span class="ext-desc">Spatial and geographic object support for PostgreSQL</span>
      </li>
      <li>
        <a href="system_stats/"><strong>system_stats</strong></a>
        <span class="ext-desc">System-level CPU, memory, and disk statistics from PostgreSQL</span>
      </li>
    </ul>
  </div>

  <div class="extension-group">
    <h3>Tools</h3>
    <ul class="extension-list">
      <li class="ext-subheading">pgEdge Tools</li>
      <li>
        <a href="ace/"><strong>ACE</strong></a>
        <span class="ext-desc">Automated data integrity verification and repair across replicated cluster nodes</span>
      </li>
      <li>
        <a href="pgedge-anonymizer/"><strong>Anonymizer</strong></a>
        <span class="ext-desc">Replace PII with realistic fake data for safe dev/test database copies</span>
      </li>
      <li>
        <a href="pgedge-loadgen/"><strong>Loadgen</strong></a>
        <span class="ext-desc">Generate realistic PostgreSQL workloads for performance testing and benchmarking</span>
      </li>
      <li>
        <a href="radar/"><strong>Radar</strong></a>
        <span class="ext-desc">Agentless diagnostic data collection for PostgreSQL and system metrics</span>
      </li>
      <li class="ext-divider"></li>
      <li class="ext-subheading">Community Tools</li>
      <li>
        <a href="pgadmin-4/"><strong>pgAdmin 4</strong></a>
        <span class="ext-desc">Web-based administration and management tool for PostgreSQL</span>
      </li>
      <li>
        <a href="pgbouncer/"><strong>PgBouncer</strong></a>
        <span class="ext-desc">Lightweight connection pooler for PostgreSQL</span>
      </li>
      <li>
        <a href="pgbackrest/"><strong>pgBackRest</strong></a>
        <span class="ext-desc">Reliable PostgreSQL backup and restore</span>
      </li>
      <li>
        <a href="postgrest/"><strong>PostgREST</strong></a>
        <span class="ext-desc">RESTful API server for any PostgreSQL database</span>
      </li>
      <li>
        <a href="psycopg2/"><strong>psycopg2</strong></a>
        <span class="ext-desc">PostgreSQL database adapter for Python</span>
      </li>
    </ul>
  </div>
</div>

<!-- Footer -->
<hr style="margin: 3rem 0; border: 0; height: 1px; background: var(--md-default-fg-color--lightest);">

<div style="text-align: center; color: var(--md-default-fg-color--light); font-size: 0.875rem; line-height: 1.6;">
  <p>
    <strong>Resources:</strong>
    <a href="https://github.com/pgEdge" style="margin: 0 0.75rem;">GitHub</a> •
    <a href="https://www.pgedge.com" style="margin: 0 0.75rem;">Website</a> •
    <a href="https://www.pgedge.com/support" style="margin: 0 0.75rem;">Support</a> •
    <a href="https://discord.com/invite/pgedge" style="margin: 0 0.75rem;">Discord</a>
  </p>
  <p style="margin-top: 1rem; font-size: 0.8rem;">
    pgEdge is built by industry veterans with decades of PostgreSQL expertise. Founded in 2022 and headquartered in Northern Virginia, pgEdge serves prominent enterprises including Bertelsmann, Qube RT, European Parliament, and multiple U.S. government agencies.
  </p>
</div>
