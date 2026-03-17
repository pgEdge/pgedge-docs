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

/* Extensions Grid */
.extensions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

@media (max-width: 768px) {
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

</style>

<!-- Hero Section -->
<div class="hero-section">
  <h1>Welcome to pgEdge Documentation</h1>
  <p class="hero-tagline">
    <strong>Enterprise-ready PostgreSQL that scales with your needs—from a single database to globally distributed multi-master deployments.</strong>
  </p>
  <p class="hero-description">
    pgEdge delivers hardened, production-grade PostgreSQL with a seamless path from day one through global scale.
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
    <a href="platform/" class="card-link">View Documentation →</a>
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

  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>Control Plane</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="16" y="16" width="6" height="6" rx="1" />
          <rect x="2" y="16" width="6" height="6" rx="1" />
          <rect x="9" y="2" width="6" height="6" rx="1" />
          <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
          <path d="M12 12V8" />
        </svg>
      </div>
    </div>
    <p class="card-description">Lifecycle management API.</p>
    <a href="control-plane/" class="card-link">View Documentation →</a>
  </div>

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

  <div class="card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>AI Toolkit</h3>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
        </svg>
      </div>
    </div>
    <p class="card-description">MCP, RAG, Vectorizer.</p>
    <a href="pgedge-postgres-mcp-server/" class="card-link">View Documentation →</a>
  </div>

</div>

<!-- Extensions & Components -->
<div class="section-header">
  <h2>Extensions &amp; Components</h2>
  <p>Purpose-built extensions that enable pgEdge's advanced capabilities.</p>
</div>

<div class="extensions-grid">
  <div class="extension-group">
    <h3>Replication &amp; Distribution</h3>
    <ul class="extension-list">
      <li>
        <a href="spock-v5/"><strong>Spock v5</strong></a>
        <span class="ext-desc">Logical multi-master replication with bi-directional data flow and conflict resolution</span>
      </li>
      <li>
        <a href="lolor/"><strong>LOLOR</strong></a>
        <span class="ext-desc">Large object replication for handling BLOBs in distributed environments</span>
      </li>
      <li>
        <a href="snowflake/"><strong>Snowflake</strong></a>
        <span class="ext-desc">Distributed sequence generation for cluster-wide unique IDs</span>
      </li>
    </ul>
  </div>

  <div class="extension-group">
    <h3>AI &amp; Agentic Capabilities</h3>
    <ul class="extension-list">
      <li>
        <a href="pgedge-postgres-mcp-server/"><strong>MCP Server</strong></a>
        <span class="ext-desc">Model Context Protocol server for LLM and AI agent access to PostgreSQL</span>
      </li>
      <li>
        <a href="pgedge-vectorizer/"><strong>Vectorizer</strong></a>
        <span class="ext-desc">Automatic document chunking and vector embedding generation</span>
      </li>
      <li>
        <a href="pgedge-rag-server/"><strong>RAG Server</strong></a>
        <span class="ext-desc">High-performance Retrieval-Augmented Generation API with hybrid search</span>
      </li>
      <li>
        <a href="pgedge-docloader/"><strong>DocLoader</strong></a>
        <span class="ext-desc">Command-line utility for loading documents into PostgreSQL for AI applications</span>
      </li>
    </ul>
  </div>

  <div class="extension-group">
    <h3>Operations &amp; Utilities</h3>
    <ul class="extension-list">
      <li>
        <a href="ace/"><strong>ACE (Active Consistency Engine)</strong></a>
        <span class="ext-desc">Automated data integrity verification and repair across replicated clusters</span>
      </li>
      <li>
        <a href="control-plane/"><strong>Control Plane</strong></a>
        <span class="ext-desc">Declarative API for database lifecycle management and orchestration</span>
      </li>
      <li>
        <a href="radar/"><strong>Radar</strong></a>
        <span class="ext-desc">Agentless diagnostic data collection for PostgreSQL and system metrics</span>
      </li>
      <li>
        <a href="pgedge-anonymizer/"><strong>Anonymizer</strong></a>
        <span class="ext-desc">PII replacement for safe dev/test database copies</span>
      </li>
      <li>
        <a href="pgedge-loadgen/"><strong>Loadgen</strong></a>
        <span class="ext-desc">Realistic workload generation and performance testing</span>
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
