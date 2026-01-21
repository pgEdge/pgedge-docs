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

.card h3 {
  margin: 0 !important;
  font-size: 1.1rem !important;
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
  gap: 0.6rem;
}

.card-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.card-links .card-link {
  font-size: 0.8rem;
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

/* Architecture Section */
.architecture-section {
  background: var(--md-code-bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.architecture-section h3 {
  margin-top: 0 !important;
  font-size: 1.2rem !important;
}

.architecture-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.architecture-feature {
  padding: 0.75rem;
  background: var(--md-default-bg-color);
  border-radius: 6px;
}

.architecture-feature strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--md-default-fg-color);
}

.architecture-feature p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--md-default-fg-color--light);
  line-height: 1.4;
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
    pgEdge delivers hardened, production-grade PostgreSQL with a seamless path from day one through global scale. Whether you're running a single database, deploying primary-replica configurations, or orchestrating active-active multi-master clusters across continents, pgEdge provides a unified platform built on 100% standard, open source PostgreSQL.
  </p>
</div>

<!-- Getting Started - Choose your Deployment -->
<div class="section-header">
  <h2>Getting Started - Choose your Deployment</h2>
  <p>Your deployment method determines how you install, configure, and manage pgEdge Enterprise Postgres. Each method provides access to the same powerful capabilities.</p>
</div>

<div class="cards-grid">
  <div class="card">
    <div class="card-header">
      <h3>pgEdge Cloud</h3>
    </div>
    <p class="card-description">
      Fully managed PostgreSQL service. Provision single-node or fully-distributed clusters in 90 seconds across AWS, Azure, or GCP. Zero infrastructure management.
    </p>
    <a href="cloud/" class="card-link">View Documentation →</a>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Kubernetes</h3>
    </div>
    <p class="card-description">
      Cloud-native deployments with Helm charts and CloudNativePG integration. Single-command installation with declarative configuration for production clusters.
    </p>
    <a href="pgedge-containers/" class="card-link">View Documentation →</a>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>VMs & Bare Metal</h3>
    </div>
    <p class="card-description">
      Direct installations on virtual machines or physical servers. Enterprise packages, CLI orchestration, Control Plane API, or Ansible automation for maximum control.
    </p>
    <div class="card-links">
      <a href="enterprise/" class="card-link">Installation →</a>
      <a href="control-plane/" class="card-link">Orchestration →</a>
    </div>
  </div>
</div>

<!-- Key Components -->
<div class="section-header">
  <h2>Key Components</h2>
  <p>Powerful components that work together to deliver enterprise PostgreSQL capabilities.</p>
</div>

<div class="cards-grid">
  <div class="card">
    <div class="card-header">
      <h3>Control Plane</h3>
    </div>
    <p class="card-description">
      Declarative API for database lifecycle management. Deploy, configure, and manage PostgreSQL clusters programmatically with Kubernetes-style orchestration.
    </p>
    <a href="control-plane/" class="card-link">View Documentation →</a>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Enterprise Repository</h3>
    </div>
    <p class="card-description">
      Hardened PostgreSQL packages (RPM/APT) with curated extensions, performance tuning, and security updates. Battle-tested for production workloads on RHEL, Debian, and Ubuntu.
    </p>
    <a href="enterprise/" class="card-link">View Documentation →</a>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>AI Toolkit</h3>
    </div>
    <p class="card-description">
      Production-ready AI infrastructure for PostgreSQL. MCP Server for AI agents, RAG pipeline with hybrid search, automatic vectorization, and document loading—all PostgreSQL-native.
    </p>
    <a href="pgedge-postgres-mcp-server/" class="card-link">View Documentation →</a>
  </div>
</div>

<!-- Extensions & Components -->
<div class="section-header">
  <h2>Extensions & Components</h2>
  <p>Purpose-built extensions that enable pgEdge's advanced capabilities.</p>
</div>

<div class="extensions-grid">
  <div class="extension-group">
    <h3>Replication & Distribution</h3>
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
    <h3>AI & Agentic Capabilities</h3>
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
    <h3>Operations & Utilities</h3>
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

<!-- How Multi-Master Works -->
<div class="architecture-section">
  <h3>How pgEdge Delivers Multi-Master Replication</h3>
  <p>Traditional PostgreSQL uses a primary-standby model where only one node accepts writes. pgEdge's multi-master (active-active) approach changes this paradigm:</p>

  <div style="text-align: center; margin-top: 1rem;">
    <img src="img/pgedge_mmr.png" alt="pgEdge Multi-Master Replication" style="width:60%; max-width:1100px; height:auto; display:block; margin:0 auto;" />

    <p style="margin-top: 1rem; font-size: 0.9rem; margin-bottom: 0;">
      <a href="https://www.pgedge.com/solutions/benefit/multi-master">Learn more about multi-master architectures →</a>
    </p>
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
