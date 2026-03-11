// Pagefind search integration
// Replaces Material's built-in search with Pagefind for smaller, chunked indexes
(function() {
    'use strict';

    var modal = null;
    var initialized = false;
    var scriptsLoaded = false;

    function createModal() {
        if (modal) return modal;

        modal = document.createElement('div');
        modal.className = 'pagefind-modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Search');
        modal.innerHTML =
            '<div class="pagefind-modal-container">' +
                '<div class="pagefind-modal-header">' +
                    '<button class="pagefind-modal-close" aria-label="Close search">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">' +
                            '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>' +
                        '</svg>' +
                    '</button>' +
                '</div>' +
                '<div id="pagefind-container"></div>' +
            '</div>';

        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeSearch();
        });

        // Close button
        modal.querySelector('.pagefind-modal-close').addEventListener('click', closeSearch);

        return modal;
    }

    var loadFailed = false;

    function loadPagefind(callback) {
        if (scriptsLoaded) { callback(); return; }
        if (loadFailed) { showSearchUnavailable(); return; }

        // Load CSS
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/pagefind/pagefind-ui.css';
        document.head.appendChild(css);

        // Load JS via script tag
        var script = document.createElement('script');
        script.src = '/pagefind/pagefind-ui.js';
        script.onload = function() {
            scriptsLoaded = true;
            callback();
        };
        script.onerror = function() {
            loadFailed = true;
            showSearchUnavailable();
        };
        document.head.appendChild(script);
    }

    function showSearchUnavailable() {
        var container = document.getElementById('pagefind-container');
        if (container) {
            container.innerHTML = '<p class="pagefind-modal-error">Search is not available during local development.<br>To test search, run: <code>mkdocs build && npx pagefind --site site</code></p>';
        }
    }

    // Map URL path prefixes to friendly product names
    // Versioned docsets use: /product-slug/version-slug/...
    var productNames = {
        'ace': 'ACE',
        'control-plane': 'Control Plane',
        'lolor': 'lolor',
        'pgedge-anonymizer': 'pgEdge Anonymizer',
        'pgedge-docloader': 'pgEdge Docloader',
        'pgedge-helm': 'pgEdge Helm',
        'pgedge-loadgen': 'pgEdge Loadgen',
        'pgedge-postgres-mcp-server': 'pgEdge Postgres MCP Server',
        'pgedge-rag-server': 'pgEdge RAG Server',
        'pgedge-vectorizer': 'pgEdge Vectorizer',
        'postgresql': 'PostgreSQL',
        'radar': 'Radar',
        'snowflake': 'Snowflake',
        'spock-v5': 'Spock v5',
        'cloud': 'pgEdge Cloud',
        'distributed': 'pgEdge Distributed Postgres',
        'enterprise': 'pgEdge Enterprise Postgres',
        'pgedge-container': 'pgEdge Container'
    };

    function getResultContext(url) {
        // Parse URL path to extract product and version
        // Paths look like: /postgresql/v17/some/page/ or /enterprise/some/page/
        var path = url.replace(/^https?:\/\/[^/]+/, '');
        var parts = path.replace(/^\/|\/$/g, '').split('/');
        if (parts.length < 1) return null;

        var product = productNames[parts[0]];
        if (!product) return null;

        // Check if second segment looks like a version
        var version = null;
        if (parts.length >= 2 && /^(v[\d]|development|pg\d)/.test(parts[1])) {
            version = parts[1].replace(/-/g, '.');
        }

        return version ? product + ' ' + version : product;
    }

    function addBadgesToResults() {
        var container = document.getElementById('pagefind-container');
        if (!container) return;

        var links = container.querySelectorAll('.pagefind-ui__result-link');
        links.forEach(function(link) {
            // Skip if already badged (check next sibling)
            if (link.nextElementSibling && link.nextElementSibling.classList.contains('pagefind-result-context')) return;

            var context = getResultContext(link.getAttribute('href'));
            if (context) {
                var badge = document.createElement('span');
                badge.className = 'pagefind-result-context';
                badge.textContent = context;
                link.parentNode.insertBefore(badge, link.nextSibling);
            }
        });
    }

    function initPagefind() {
        if (initialized) return;
        if (typeof PagefindUI === 'undefined') return;

        new PagefindUI({
            element: '#pagefind-container',
            showSubResults: true,
            showImages: false,
            autofocus: true
        });

        // Watch for results being added to the DOM and inject badges
        var container = document.getElementById('pagefind-container');
        if (container) {
            var observer = new MutationObserver(addBadgesToResults);
            observer.observe(container, { childList: true, subtree: true });
        }

        initialized = true;
    }

    function openSearch() {
        createModal();
        modal.classList.add('pagefind-modal--active');
        document.body.style.overflow = 'hidden';
        loadPagefind(function() {
            initPagefind();
            // Focus the search input
            var input = modal.querySelector('.pagefind-ui__search-input');
            if (input) {
                setTimeout(function() { input.focus(); }, 50);
            }
        });
    }

    function closeSearch() {
        if (!modal) return;
        modal.classList.remove('pagefind-modal--active');
        document.body.style.overflow = '';
    }

    function addSearchButton() {
        // Add search button to header (before the source/repo section)
        var header = document.querySelector('.md-header__inner');
        if (!header || header.querySelector('.md-header__button--search')) return;

        var btn = document.createElement('label');
        btn.className = 'md-header__button md-icon md-header__button--search';
        btn.setAttribute('aria-label', 'Search');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
                '<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z" fill="currentColor"/>' +
            '</svg>';
        btn.addEventListener('click', openSearch);

        var source = header.querySelector('.md-header__source');
        if (source) {
            header.insertBefore(btn, source);
        } else {
            header.appendChild(btn);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        var active = document.activeElement;
        var isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable);

        // Open search with / or Ctrl/Cmd+K (when not in an input)
        if (!isInput && (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey)))) {
            e.preventDefault();
            openSearch();
            return;
        }
        // Close with Escape
        if (e.key === 'Escape' && modal && modal.classList.contains('pagefind-modal--active')) {
            e.preventDefault();
            closeSearch();
        }
    });

    // Init on page load
    addSearchButton();

    // Re-init on Material instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() { addSearchButton(); });
    }
})();
