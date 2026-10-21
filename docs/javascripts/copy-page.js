// "Copy page" button beside the page title, copying the page's markdown for
// pasting into an AI assistant. Only pages with a markdown version get one;
// scripts/markdown_pages.py marks those with a text/markdown alternate link.
(function() {
    'use strict';

    var LABEL = 'Copy page';

    function show(button, message) {
        button.textContent = message;
        setTimeout(function() {
            button.textContent = LABEL;
        }, 2000);
    }

    function copy(button, url) {
        var text = fetch(url).then(function(response) {
            if (!response.ok) throw new Error(response.status);
            return response.text();
        });
        // Safari allows a clipboard write only within the click itself, so
        // the fetch goes to ClipboardItem as a promise instead of being
        // awaited first.
        var written = window.ClipboardItem
            ? navigator.clipboard.write([new ClipboardItem({
                'text/plain': text.then(function(markdown) {
                    return new Blob([markdown], { type: 'text/plain' });
                })
            })])
            : text.then(function(markdown) {
                return navigator.clipboard.writeText(markdown);
            });
        written.then(function() {
            show(button, 'Copied');
        }, function() {
            show(button, 'Copy failed');
        });
    }

    function init() {
        var link = document.querySelector(
            'link[rel="alternate"][type="text/markdown"]');
        // A title inside a layout block, as on the home page, has no room.
        var heading = document.querySelector(
            'article.md-content__inner > h1');
        if (!link || !heading || !navigator.clipboard) return;

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'md-copy-page';
        button.textContent = LABEL;
        button.setAttribute('aria-live', 'polite');
        button.addEventListener('click', function() {
            copy(button, link.href);
        });
        heading.parentNode.insertBefore(button, heading);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
