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

/* ICON SIZE — adjust this */
.card-icon {
  width: 56px !important;
  height: 56px !important;
  flex: 0 0 56px !important;
  display: block !important;

  /* defeat theme/global svg sizing rules */
  max-width: none !important;
  max-height: none !important;
}

.card-icon .stroke {
  stroke: #2b2b2b;
  stroke-width: 1.4;      /* lighter at this size */
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.card-icon .accent {
  stroke: #00bcd4;
  stroke-width: 1.8;      /* lighter at this size */
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
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
        <svg class="card-icon" viewBox="4 5 16 16" aria-hidden="true">
          <rect class="stroke" x="7" y="6.5" width="10" height="4" rx="1"/>
          <rect class="stroke" x="7" y="12" width="10" height="4" rx="1"/>
          <circle class="accent" cx="15.8" cy="8.5" r="0.9"/>
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
        <svg class="card-icon" viewBox="4 4 16 16" aria-hidden="true">
          <polygon class="stroke"
            points="12 5.5 17 8.4 17 15.6 12 18.5 7 15.6 7 8.4" />
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
          <path class="stroke"
            d="M6 17h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A3.2 3.2 0 0 0 6 17z"/>
          <path class="accent" d="M9 13.8h6"/>
          <path class="accent" d="M12 11.8v5"/>
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
        <svg class="card-icon" viewBox="4 5 16 16" aria-hidden="true">
          <path class="stroke" d="M7 8h10"/>
          <path class="stroke" d="M7 13h10"/>
          <circle class="accent" cx="16.5" cy="8" r="0.9"/>
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
        <svg class="card-icon" viewBox="4 5 16 16" aria-hidden="true">
          <path class="stroke" d="M12 6.5l5 2.9v6.2L12 18.5 7 15.6V9.4L12 6.5z"/>
          <path class="accent" d="M12 7.2v10.6"/>
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
        <svg class="card-icon" viewBox="4 5 16 16" aria-hidden="true">
          <circle class="accent" cx="12" cy="11" r="3"/>
          <circle class="stroke" cx="12" cy="11" r="5"/>
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
