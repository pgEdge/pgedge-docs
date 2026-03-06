/* global document$ */
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
  if (mount.dataset.initialized || mount.dataset.initializing) return;
  mount.dataset.initializing = "true";

  var catalog = null;

  fetch("catalog.json")
    .then(function(resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then(function(data) {
      catalog = data;
      mount.dataset.initialized = "true";
      delete mount.dataset.initializing;
      buildUI(mount, catalog);
    })
    .catch(function() {
      delete mount.dataset.initializing;
      mount.innerHTML =
        '<p style="color:var(--md-code-hl-special-color);padding:2rem;text-align:center">' +
        "Failed to load catalog data. Make sure catalog.json is served alongside this page.</p>";
    });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;}

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
  var pgEl = makeSelect("pc-pg-version", "PostgreSQL Version");
  var metaEl = makeSelect("pc-meta-package", "Package");

  grid.appendChild(platformEl.group);
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
  copyBtn.innerHTML =    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
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

    codeEl.innerHTML = lines.map(function(l) {      if (l.text === "") return "";
      if (l.comment) return '<span class="comment">' + escapeHtml(l.text) + "</span>";      return escapeHtml(l.text);
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
    updateMetaDesc();
    updateCommands();
  }

  platformEl.select.addEventListener("change", function() {
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

    function onSuccess() {
      copyBtn.classList.add("copied");
      copyBtn.querySelector("span").textContent = "Copied!";
      setTimeout(function() {
        copyBtn.classList.remove("copied");
        copyBtn.querySelector("span").textContent = "Copy All";
      }, 2000);
    }

    function onError() {
      copyBtn.classList.add("copy-error");
      copyBtn.querySelector("span").textContent = "Failed";
      setTimeout(function() {
        copyBtn.classList.remove("copy-error");
        copyBtn.querySelector("span").textContent = "Copy All";
      }, 2000);
    }

    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        onSuccess();
      } catch (e) {
        onError();
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(onSuccess).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
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
    header.innerHTML =      "<span>" + escapeHtml(cat.name) +      ' <span class="count">(' + cat.packages.length + ")</span></span>" +      '<span class="arrow">&#9654;</span>';

    header.addEventListener("click", function() {
      var isOpen = div.classList.contains("open");
      if (isOpen) {
        div.querySelectorAll(".pkg-row.expanded").forEach(function(row) {
          row.classList.remove("expanded");
          row.setAttribute("aria-expanded", "false");
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

      row.innerHTML =        "<div>" +
        '<div class="pkg-name">' + escapeHtml(pkg.name) + "</div>" +        '<div class="pkg-desc">' + escapeHtml(pkg.description) + "</div>" +        '<div class="pkg-badges pkg-badges-spaced">' + pgBadges + "</div>" +        "</div>" +
        '<div class="pkg-meta">' + includedBadges + "</div>";

      body.appendChild(row);

      /* Click-to-install: show install command for this package */
      if (pkg.package_name) {
        row.classList.add("clickable");
        row.setAttribute("role", "button");
        row.setAttribute("tabindex", "0");
        row.setAttribute("aria-expanded", "false");
        row.dataset.packageName = pkg.package_name;
        var installEl = document.createElement("div");
        installEl.className = "pkg-install";
        body.appendChild(installEl);

        var toggleInstall = (function(pkgName, instEl, r) {
          return function() {
            var wasExpanded = r.classList.contains("expanded");
            /* Collapse any other expanded row in this category */
            body.querySelectorAll(".pkg-row.expanded").forEach(function(er) {
              er.classList.remove("expanded");
              er.setAttribute("aria-expanded", "false");
            });
            if (wasExpanded) return;
            /* Build install command from current selections */
            var platformKey = document.getElementById("pc-platform").value;
            var pgVer = document.getElementById("pc-pg-version").value;
            var platform = catalog.platforms[platformKey];
            var resolved = pkgName.replace(/\{ver\}/g, pgVer);
            var cmd = platform.install_pattern.replace("{package}", resolved);
            instEl.textContent = cmd;
            r.classList.add("expanded");
            r.setAttribute("aria-expanded", "true");
          };
        })(pkg.package_name, installEl, row);

        row.addEventListener("click", toggleInstall);
        row.addEventListener("keydown", function(e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleInstall();
          }
        });
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
  return catalog.meta_packages.find(function(mp) { return mp.id === id; }) || null;
}
