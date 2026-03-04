/* package-catalog.js
 * Self-contained vanilla JS that builds the pgEdge Enterprise install
 * configurator and package browser inside an MkDocs Material page.
 * Activates only when a <div id="package-catalog"></div> mount point exists.
 */

document$.subscribe(function() {
  var mount = document.getElementById("package-catalog");
  if (!mount) return;
  initPackageCatalog(mount);
});

function initPackageCatalog(mount) {
  if (mount.dataset.initialized) return;
  mount.dataset.initialized = "true";

  injectCatalogStyles();

  var catalog = null;

  fetch("catalog.json")
    .then(function(resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then(function(data) {
      catalog = data;
      buildUI(mount, catalog);
    })
    .catch(function() {
      mount.innerHTML =
        '<p style="color:var(--md-code-hl-special-color);padding:2rem;text-align:center">' +
        "Failed to load catalog data. Make sure catalog.json is served alongside this page.</p>";
    });
}

/* ------------------------------------------------------------------ */
/*  Style injection                                                    */
/* ------------------------------------------------------------------ */

function injectCatalogStyles() {
  if (document.getElementById("package-catalog-styles")) return;
  var style = document.createElement("style");
  style.id = "package-catalog-styles";
  style.textContent = [
    "#package-catalog .zone { margin-bottom: 2.5rem; }",
    "#package-catalog .zone h2 { font-size: 1.3rem; margin-bottom: 0.75rem; }",
    "#package-catalog .zone-desc {",
    "  color: var(--md-default-fg-color--light);",
    "  font-size: 0.9rem;",
    "  margin-bottom: 1rem;",
    "}",

    /* Zone 1: Selector */
    "#package-catalog .selector-grid {",
    "  display: grid;",
    "  grid-template-columns: repeat(2, 1fr);",
    "  gap: 1rem;",
    "}",
    "#package-catalog .selector-group label {",
    "  display: block;",
    "  font-size: 0.85rem;",
    "  font-weight: 600;",
    "  color: var(--md-default-fg-color--light);",
    "  margin-bottom: 0.25rem;",
    "}",
    "#package-catalog .selector-group select {",
    "  width: 100%;",
    "  padding: 0.6rem 0.75rem;",
    "  border: 1px solid var(--md-default-fg-color--lightest);",
    "  border-radius: 8px;",
    "  font-size: 0.95rem;",
    "  background: var(--md-default-bg-color);",
    "  color: var(--md-default-fg-color);",
    "  cursor: pointer;",
    "}",
    "#package-catalog .selector-group select:focus {",
    "  outline: none;",
    "  border-color: var(--md-accent-fg-color);",
    "  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-accent-fg-color) 15%, transparent);",
    "}",

    /* Meta-package description */
    "#package-catalog .meta-desc {",
    "  font-size: 0.875rem;",
    "  color: var(--md-default-fg-color--light);",
    "  margin-top: 0.5rem;",
    "}",

    /* Zone 2: Commands */
    "#package-catalog .commands-header {",
    "  display: flex;",
    "  justify-content: space-between;",
    "  align-items: center;",
    "  margin-bottom: 0.75rem;",
    "}",
    "#package-catalog .copy-btn {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 0.4rem;",
    "  padding: 0.4rem 0.8rem;",
    "  border: 1px solid var(--md-default-fg-color--lightest);",
    "  border-radius: 6px;",
    "  background: var(--md-default-bg-color);",
    "  font-size: 0.85rem;",
    "  cursor: pointer;",
    "  color: var(--md-default-fg-color--light);",
    "  transition: all 0.15s;",
    "}",
    "#package-catalog .copy-btn:hover {",
    "  border-color: var(--md-accent-fg-color);",
    "  color: var(--md-accent-fg-color);",
    "}",
    "#package-catalog .copy-btn.copied {",
    "  border-color: #22c55e;",
    "  color: #22c55e;",
    "}",
    "#package-catalog .install-commands {",
    "  background: var(--md-code-bg-color);",
    "  color: var(--md-code-fg-color);",
    "  padding: 1.5rem;",
    "  border-radius: 12px;",
    "  overflow-x: auto;",
    "  font-size: 0.9rem;",
    "  line-height: 1.7;",
    "}",
    "#package-catalog .install-commands code {",
    "  font-family: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, monospace;",
    "}",
    "#package-catalog .install-commands .comment {",
    "  color: var(--md-default-fg-color--light);",
    "}",

    /* Zone 3: Catalog */
    "#package-catalog .category {",
    "  border: 1px solid var(--md-default-fg-color--lightest);",
    "  border-radius: 12px;",
    "  margin-bottom: 0.75rem;",
    "  overflow: hidden;",
    "  background: var(--md-default-bg-color);",
    "}",
    "#package-catalog .category-header {",
    "  padding: 0.75rem 1rem;",
    "  cursor: pointer;",
    "  display: flex;",
    "  justify-content: space-between;",
    "  align-items: center;",
    "  font-weight: 600;",
    "  user-select: none;",
    "  color: var(--md-default-fg-color);",
    "}",
    "#package-catalog .category-header:hover {",
    "  background: var(--md-default-fg-color--lightest);",
    "}",
    "#package-catalog .category-header .count {",
    "  color: var(--md-default-fg-color--light);",
    "  font-weight: 400;",
    "  font-size: 0.85rem;",
    "}",
    "#package-catalog .category-header .arrow {",
    "  transition: transform 0.2s;",
    "}",
    "#package-catalog .category.open .category-header .arrow {",
    "  transform: rotate(90deg);",
    "}",
    "#package-catalog .category-body {",
    "  display: none;",
    "  border-top: 1px solid var(--md-default-fg-color--lightest);",
    "}",
    "#package-catalog .category.open .category-body { display: block; }",
    "#package-catalog .pkg-row {",
    "  padding: 0.6rem 1rem;",
    "  border-bottom: 1px solid var(--md-default-fg-color--lightest);",
    "  display: flex;",
    "  justify-content: space-between;",
    "  align-items: flex-start;",
    "  gap: 1rem;",
    "}",
    "#package-catalog .pkg-row:last-of-type { border-bottom: none; }",
    "#package-catalog .pkg-name {",
    "  font-weight: 500;",
    "  font-size: 0.95rem;",
    "  color: var(--md-default-fg-color);",
    "}",
    "#package-catalog .pkg-desc {",
    "  color: var(--md-default-fg-color--light);",
    "  font-size: 0.85rem;",
    "}",
    "#package-catalog .pkg-meta {",
    "  font-size: 0.8rem;",
    "  color: var(--md-default-fg-color--light);",
    "  white-space: nowrap;",
    "}",
    "#package-catalog .pkg-badges {",
    "  display: flex;",
    "  gap: 0.3rem;",
    "  flex-wrap: wrap;",
    "}",
    "#package-catalog .badge {",
    "  display: inline-block;",
    "  padding: 0.1rem 0.4rem;",
    "  border-radius: 4px;",
    "  font-size: 0.75rem;",
    "  background: var(--md-default-fg-color--lightest);",
    "  color: var(--md-default-fg-color--light);",
    "}",
    "#package-catalog .badge.included {",
    "  margin-right: 0.25rem;",
    "}",
    "#package-catalog .badge.badge-full {",
    "  background: color-mix(in srgb, #22c55e 15%, var(--md-default-bg-color));",
    "  color: #22c55e;",
    "}",
    "#package-catalog .badge.badge-minimal {",
    "  background: color-mix(in srgb, #a855f7 15%, var(--md-default-bg-color));",
    "  color: #a855f7;",
    "}",
    "#package-catalog .pkg-row.clickable { cursor: pointer; }",
    "#package-catalog .pkg-row.clickable:hover {",
    "  background: var(--md-default-fg-color--lightest);",
    "}",
    "#package-catalog .pkg-install {",
    "  display: none;",
    "  padding: 0.5rem 1rem;",
    "  background: var(--md-code-bg-color);",
    "  font-family: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, monospace;",
    "  font-size: 0.85rem;",
    "  color: var(--md-code-fg-color);",
    "  border-bottom: 1px solid var(--md-default-fg-color--lightest);",
    "  user-select: all;",
    "}",
    "#package-catalog .pkg-row.expanded + .pkg-install { display: block; }",

    /* Responsive */
    "@media (max-width: 480px) {",
    "  #package-catalog .selector-grid { grid-template-columns: 1fr; }",
    "}"
  ].join("\n");
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ------------------------------------------------------------------ */
/*  Build the full UI                                                  */
/* ------------------------------------------------------------------ */

function buildUI(mount, catalog) {
  mount.innerHTML = "";

  /* -- Zone 1: Selector ------------------------------------------- */
  var zone1 = document.createElement("section");
  zone1.className = "zone";

  var h2sel = document.createElement("h2");
  h2sel.textContent = "Configure Your Install";
  zone1.appendChild(h2sel);

  var grid = document.createElement("div");
  grid.className = "selector-grid";

  var platformEl = makeSelect("pc-platform", "Platform");
  var archEl = makeSelect("pc-arch", "Architecture");
  var pgEl = makeSelect("pc-pg-version", "PostgreSQL Version");
  var metaEl = makeSelect("pc-meta-package", "Package");

  grid.appendChild(platformEl.group);
  grid.appendChild(archEl.group);
  grid.appendChild(pgEl.group);
  grid.appendChild(metaEl.group);
  zone1.appendChild(grid);

  /* Meta-package description */
  var metaDesc = document.createElement("p");
  metaDesc.className = "meta-desc";
  zone1.appendChild(metaDesc);

  mount.appendChild(zone1);

  /* -- Zone 2: Commands ------------------------------------------- */
  var zone2 = document.createElement("section");
  zone2.className = "zone";

  var cmdHeader = document.createElement("div");
  cmdHeader.className = "commands-header";
  var h2cmd = document.createElement("h2");
  h2cmd.textContent = "Install Commands";

  var copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.title = "Copy all commands";
  copyBtn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
    '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
    " <span>Copy All</span>";

  cmdHeader.appendChild(h2cmd);
  cmdHeader.appendChild(copyBtn);
  zone2.appendChild(cmdHeader);

  var pre = document.createElement("pre");
  pre.className = "install-commands";
  var codeEl = document.createElement("code");
  pre.appendChild(codeEl);
  zone2.appendChild(pre);

  mount.appendChild(zone2);

  /* -- Zone 3: Catalog -------------------------------------------- */
  var zone3 = document.createElement("section");
  zone3.className = "zone";

  var h2cat = document.createElement("h2");
  h2cat.textContent = "Package Catalog";
  zone3.appendChild(h2cat);

  var catDesc = document.createElement("p");
  catDesc.className = "zone-desc";
  catDesc.textContent = "Click a package to see its install command based on your platform selection above. The pgEdge repository must already be configured.";
  zone3.appendChild(catDesc);

  var catalogTree = document.createElement("div");
  zone3.appendChild(catalogTree);

  mount.appendChild(zone3);

  /* -- Populate selectors ----------------------------------------- */
  Object.keys(catalog.platforms).forEach(function(key) {
    var plat = catalog.platforms[key];
    var opt = document.createElement("option");
    opt.value = key;
    opt.textContent = plat.label;
    if (key === catalog.default_platform) opt.selected = true;
    platformEl.select.appendChild(opt);
  });

  catalog.pg_versions.forEach(function(ver) {
    var opt = document.createElement("option");
    opt.value = ver;
    opt.textContent = "PG " + ver;
    if (ver === catalog.default_pg_version) opt.selected = true;
    pgEl.select.appendChild(opt);
  });

  catalog.meta_packages.forEach(function(mp) {
    var opt = document.createElement("option");
    opt.value = mp.id;
    opt.textContent = mp.label;
    metaEl.select.appendChild(opt);
  });

  function updateArchOptions() {
    var platform = catalog.platforms[platformEl.select.value];
    var currentArch = archEl.select.value;
    archEl.select.innerHTML = "";
    platform.architectures.forEach(function(arch) {
      var opt = document.createElement("option");
      opt.value = arch;
      opt.textContent = arch === "x86_64" ? "x86_64 (Intel/AMD)" : "aarch64 (ARM)";
      if (arch === currentArch || arch === catalog.default_arch) opt.selected = true;
      archEl.select.appendChild(opt);
    });
  }

  function updateMetaDesc() {
    var metaId = metaEl.select.value;
    var meta = findMeta(catalog, metaId);
    metaDesc.textContent = meta ? meta.description : "";
  }

  function updateCommands() {
    var platformKey = platformEl.select.value;
    var pgVer = pgEl.select.value;
    var metaId = metaEl.select.value;
    var platform = catalog.platforms[platformKey];
    var meta = findMeta(catalog, metaId);

    var pkgName = platform.pkg_manager === "dnf"
      ? meta.rpm_pattern.replace("{ver}", pgVer)
      : meta.deb_pattern.replace("{ver}", pgVer);

    var lines = [];
    var hasPrereqs = platform.prerequisites.length > 0;

    if (hasPrereqs) {
      lines.push({ text: "# 1. Configure prerequisites", comment: true });
      platform.prerequisites.forEach(function(cmd) {
        lines.push({ text: cmd });
      });
      lines.push({ text: "" });
      lines.push({ text: "# 2. Add pgEdge repository", comment: true });
    } else {
      lines.push({ text: "# 1. Add pgEdge repository", comment: true });
    }
    lines.push({ text: platform.repo_install });
    lines.push({ text: "" });

    var stepNum = hasPrereqs ? 3 : 2;
    lines.push({ text: "# " + stepNum + ". Install " + meta.label, comment: true });
    lines.push({ text: platform.install_pattern.replace("{package}", pkgName) });
    lines.push({ text: "" });

    lines.push({ text: "# " + (stepNum + 1) + ". Initialize and start", comment: true });
    lines.push({ text: platform.init_pattern.replace(/{ver}/g, pgVer) });
    lines.push({ text: platform.start_pattern.replace(/{ver}/g, pgVer) });

    codeEl.innerHTML = lines.map(function(l) {
      if (l.text === "") return "";
      if (l.comment) return '<span class="comment">' + escapeHtml(l.text) + "</span>";
      return escapeHtml(l.text);
    }).join("\n");
  }

  function updateExpandedInstalls() {
    catalogTree.querySelectorAll(".pkg-row.expanded").forEach(function(row) {
      var installEl = row.nextElementSibling;
      if (!installEl || !installEl.classList.contains("pkg-install")) return;
      var pkgName = row.dataset.packageName;
      if (!pkgName) return;
      var platformKey = platformEl.select.value;
      var pgVer = pgEl.select.value;
      var platform = catalog.platforms[platformKey];
      var resolved = pkgName.replace(/\{ver\}/g, pgVer);
      installEl.textContent = platform.install_pattern.replace("{package}", resolved);
    });
  }

  function refresh() {
    updateArchOptions();
    updateMetaDesc();
    updateCommands();
  }

  platformEl.select.addEventListener("change", function() {
    updateArchOptions();
    updateCommands();
    updateExpandedInstalls();
  });
  archEl.select.addEventListener("change", function() {
    updateCommands();
    updateExpandedInstalls();
  });
  pgEl.select.addEventListener("change", function() {
    updateCommands();
    updateExpandedInstalls();
  });
  metaEl.select.addEventListener("change", function() {
    updateMetaDesc();
    updateCommands();
  });

  /* Copy button */
  copyBtn.addEventListener("click", function() {
    var code = codeEl.textContent;
    navigator.clipboard.writeText(code).then(function() {
      copyBtn.classList.add("copied");
      copyBtn.querySelector("span").textContent = "Copied!";
      setTimeout(function() {
        copyBtn.classList.remove("copied");
        copyBtn.querySelector("span").textContent = "Copy All";
      }, 2000);
    });
  });

  /* -- Render catalog tree ---------------------------------------- */
  renderCatalogTree(catalogTree, catalog);

  /* -- Initial render --------------------------------------------- */
  refresh();
}

/* ------------------------------------------------------------------ */
/*  Catalog tree                                                       */
/* ------------------------------------------------------------------ */

function renderCatalogTree(container, catalog) {
  container.innerHTML = "";

  catalog.categories.forEach(function(cat) {
    var div = document.createElement("div");
    div.className = "category";

    var header = document.createElement("div");
    header.className = "category-header";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-expanded", "false");
    header.innerHTML =
      "<span>" + escapeHtml(cat.name) +
      ' <span class="count">(' + cat.packages.length + ")</span></span>" +
      '<span class="arrow">&#9654;</span>';

    header.addEventListener("click", function() {
      var isOpen = div.classList.contains("open");
      if (isOpen) {
        div.querySelectorAll(".pkg-row.expanded").forEach(function(row) {
          row.classList.remove("expanded");
        });
      }
      div.classList.toggle("open");
      header.setAttribute("aria-expanded", div.classList.contains("open") ? "true" : "false");
    });

    header.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });

    var body = document.createElement("div");
    body.className = "category-body";

    cat.packages.forEach(function(pkg) {
      var row = document.createElement("div");
      row.className = "pkg-row";

      var includedBadges = pkg.included_in.map(function(id) {
        var mp = findMeta(catalog, id);
        var label = mp ? mp.label.split("(")[0].trim() : id;
        return '<span class="badge included badge-' + escapeHtml(id) + '">' + escapeHtml(label) + "</span>";
      }).join("");

      var pgBadges = pkg.pg_versions.map(function(v) {
        return '<span class="badge">PG ' + escapeHtml(v) + "</span>";
      }).join("");

      row.innerHTML =
        "<div>" +
        '<div class="pkg-name">' + escapeHtml(pkg.name) + "</div>" +
        '<div class="pkg-desc">' + escapeHtml(pkg.description) + "</div>" +
        '<div class="pkg-badges" style="margin-top:0.3rem">' + pgBadges + "</div>" +
        "</div>" +
        '<div class="pkg-meta">' + includedBadges + "</div>";

      body.appendChild(row);

      /* Click-to-install: show install command for this package */
      if (pkg.package_name) {
        row.classList.add("clickable");
        row.dataset.packageName = pkg.package_name;
        var installEl = document.createElement("div");
        installEl.className = "pkg-install";
        body.appendChild(installEl);

        row.addEventListener("click", (function(pkgName, instEl) {
          return function() {
            var wasExpanded = row.classList.contains("expanded");
            /* Collapse any other expanded row in this category */
            body.querySelectorAll(".pkg-row.expanded").forEach(function(r) {
              r.classList.remove("expanded");
            });
            if (wasExpanded) return;
            /* Build install command from current selections */
            var platformKey = document.getElementById("pc-platform").value;
            var pgVer = document.getElementById("pc-pg-version").value;
            var platform = catalog.platforms[platformKey];
            var resolved = pkgName.replace(/\{ver\}/g, pgVer);
            var cmd = platform.install_pattern.replace("{package}", resolved);
            instEl.textContent = cmd;
            row.classList.add("expanded");
          };
        })(pkg.package_name, installEl));
      }
    });

    div.appendChild(header);
    div.appendChild(body);
    container.appendChild(div);
  });
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function makeSelect(id, labelText) {
  var group = document.createElement("div");
  group.className = "selector-group";
  var label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;
  var select = document.createElement("select");
  select.id = id;
  group.appendChild(label);
  group.appendChild(select);
  return { group: group, select: select };
}

function findMeta(catalog, id) {
  for (var i = 0; i < catalog.meta_packages.length; i++) {
    if (catalog.meta_packages[i].id === id) {
      return catalog.meta_packages[i];
    }
  }
  return null;
}
