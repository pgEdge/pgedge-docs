/**
 * Ask Ellie - AI Chat Interface for pgEdge Documentation
 *
 * A floating chat assistant that connects to pgedge-rag-server for
 * RAG-powered Q&A about pgEdge products.
 */
(function() {
    'use strict';

    // =========================================================================
    // Configuration
    // =========================================================================
    const CONFIG = {
        api: {
            production: '/api/chat',
            development: 'http://localhost:8080',
            pipelineName: 'pgedge-docs',
            timeout: 60000,
            healthCheckTimeout: 3000
        },
        compaction: {
            maxTokens: 15000,
            maxMessages: 15,
            recentWindow: 4,
            minImportantMessages: 3,
            charsPerToken: 4.0,
            multipliers: {
                code: 1.1,
                json: 1.15,
                natural: 1.0
            }
        },
        ui: {
            maxInputHeight: 120,
            historySize: 50,
            busyMessageInterval: 3000
        },
        busyMessages: [
            "Consulting the elephants...",
            "Checking replication status...",
            "Querying distributed nodes...",
            "Synchronizing knowledge bases...",
            "Traversing B-trees...",
            "Ensuring high availability...",
            "Running EXPLAIN ANALYZE on your question...",
            "Negotiating consensus...",
            "Checking WAL segments...",
            "Coordinating with Spock...",
            "Parsing your query...",
            "Joining tables of knowledge...",
            "Resolving conflicts...",
            "Warming up the connection pool...",
            "Following the indexes..."
        ],
        storage: {
            messages: 'ellie_chat_messages',
            fullHistory: 'ellie_chat_full_history',
            inputHistory: 'ellie_input_history',
            isOpen: 'ellie_chat_open'
        }
    };

    // =========================================================================
    // StreamBuffer - Buffers streaming content for smoother display
    // =========================================================================
    // Waits for word boundaries before displaying text, and streams code blocks
    // progressively with a "pending" indicator until they're complete.
    class StreamBuffer {
        constructor() {
            this.content = '';  // Full accumulated content
        }

        /**
         * Add a chunk and return display info.
         * @param {string} chunk - New content from stream
         * @returns {{ content: string, hasPendingCode: boolean }}
         */
        add(chunk) {
            this.content += chunk;
            return this.getDisplayInfo();
        }

        /**
         * Get content safe to display and whether there's a pending code block.
         * - Text is shown up to the last word boundary
         * - Code blocks are shown progressively with hasPendingCode flag
         */
        getDisplayInfo() {
            const analysis = this.analyzeContent();
            return {
                content: this.content.slice(0, analysis.safePoint),
                hasPendingCode: analysis.inCodeBlock
            };
        }

        /**
         * Analyze content to find safe display point and code block state.
         */
        analyzeContent() {
            let pos = 0;
            let inCodeBlock = false;
            let lastSafePoint = 0;

            while (pos < this.content.length) {
                // Check for code fence (```)
                if (this.content.slice(pos, pos + 3) === '```') {
                    if (!inCodeBlock) {
                        // Entering code block
                        inCodeBlock = true;
                        pos += 3;
                        // Skip language identifier
                        while (pos < this.content.length && this.content[pos] !== '\n') {
                            pos++;
                        }
                        if (pos < this.content.length) pos++;
                        continue;
                    } else {
                        // Leaving code block - it's now complete
                        inCodeBlock = false;
                        pos += 3;
                        // Include trailing newline if present
                        if (pos < this.content.length && this.content[pos] === '\n') {
                            pos++;
                        }
                        lastSafePoint = pos;
                        continue;
                    }
                }
                pos++;
            }

            if (inCodeBlock) {
                // Inside code block - show everything (will be rendered as pending)
                return { safePoint: this.content.length, inCodeBlock: true };
            }

            // Not in code block - find last word boundary after lastSafePoint
            let lastWordBoundary = lastSafePoint;
            for (let i = lastSafePoint; i < this.content.length; i++) {
                if (/\s/.test(this.content[i])) {
                    lastWordBoundary = i + 1; // Include the whitespace
                }
            }

            return { safePoint: lastWordBoundary, inCodeBlock: false };
        }

        /**
         * Get the full accumulated content (for final display).
         */
        getFullContent() {
            return this.content;
        }

        /**
         * Reset the buffer for a new stream.
         */
        reset() {
            this.content = '';
        }
    }

    // =========================================================================
    // TokenCounter - Estimates token count for messages
    // =========================================================================
    class TokenCounter {
        constructor(config = CONFIG.compaction) {
            this.charsPerToken = config.charsPerToken;
            this.multipliers = config.multipliers;
        }

        detectContentType(text) {
            if (/```|`[^`]+`|function\s|const\s|let\s|var\s|=>/i.test(text)) {
                return 'code';
            }
            if (/^\s*[\[{]/.test(text) && /[\]}]\s*$/.test(text)) {
                return 'json';
            }
            return 'natural';
        }

        estimateTokens(content) {
            if (!content) return 0;
            const contentType = this.detectContentType(content);
            const multiplier = this.multipliers[contentType];
            return Math.ceil((content.length / this.charsPerToken) * multiplier);
        }

        countMessages(messages) {
            return messages.reduce((sum, msg) => {
                return sum + this.estimateTokens(msg.content);
            }, 0);
        }
    }

    // =========================================================================
    // MessageClassifier - Classifies messages by importance
    // =========================================================================
    class MessageClassifier {
        static PRIORITIES = {
            ANCHOR: 1.0,
            IMPORTANT: 0.8,
            CONTEXTUAL: 0.65,
            ROUTINE: 0.4,
            TRANSIENT: 0.1
        };

        classify(message, index) {
            const { role, content } = message;
            const lowercaseContent = (content || '').toLowerCase();

            // First message is always anchor
            if (index === 0) {
                return { category: 'anchor', priority: MessageClassifier.PRIORITIES.ANCHOR };
            }

            // Transient: brief acknowledgments
            if (content && content.length < 15 && /^(ok|yes|no|thanks|got it|i see)/i.test(lowercaseContent)) {
                return { category: 'transient', priority: MessageClassifier.PRIORITIES.TRANSIENT };
            }

            if (role === 'user') {
                // User corrections are important
                if (/actually|instead|wrong|correct|fix/i.test(lowercaseContent)) {
                    return { category: 'anchor', priority: MessageClassifier.PRIORITIES.ANCHOR };
                }
                // Substantive questions
                if (content && (content.length > 50 || /\?/.test(content))) {
                    return { category: 'important', priority: MessageClassifier.PRIORITIES.IMPORTANT };
                }
            }

            if (role === 'assistant') {
                // Long responses with detailed information
                if (content && content.length > 500) {
                    return { category: 'contextual', priority: MessageClassifier.PRIORITIES.CONTEXTUAL };
                }
                // Contains code blocks
                if (/```/.test(content || '')) {
                    return { category: 'important', priority: MessageClassifier.PRIORITIES.IMPORTANT };
                }
            }

            return { category: 'routine', priority: MessageClassifier.PRIORITIES.ROUTINE };
        }
    }

    // =========================================================================
    // Compactor - Compacts conversation history to reduce tokens
    // =========================================================================
    class Compactor {
        constructor(config = CONFIG.compaction) {
            this.config = config;
            this.tokenCounter = new TokenCounter(config);
            this.classifier = new MessageClassifier();
        }

        shouldCompact(messages) {
            const tokenCount = this.tokenCounter.countMessages(messages);
            return messages.length > this.config.maxMessages ||
                   tokenCount > this.config.maxTokens;
        }

        compact(messages) {
            if (!this.shouldCompact(messages)) {
                return { messages, wasSummarized: false };
            }

            // Step 1: Classify all messages
            const classified = messages.map((msg, i) => ({
                ...msg,
                ...this.classifier.classify(msg, i),
                index: i
            }));

            // Step 2: Identify segments
            const anchorMessages = classified.filter(m => m.category === 'anchor');
            const recentMessages = classified.slice(-this.config.recentWindow);
            const middleMessages = classified.slice(1, -this.config.recentWindow);

            // Step 3: Select important middle messages
            const importantMiddle = middleMessages
                .filter(m => m.priority >= 0.65)
                .sort((a, b) => b.priority - a.priority)
                .slice(0, this.config.minImportantMessages);

            // Step 4: Build compacted set
            const kept = [
                ...anchorMessages,
                ...importantMiddle.sort((a, b) => a.index - b.index),
                ...recentMessages
            ];

            // Remove duplicates based on index and sort by original order
            const seen = new Set();
            const uniqueKept = kept
                .filter(m => {
                    if (seen.has(m.index)) return false;
                    seen.add(m.index);
                    return true;
                })
                .sort((a, b) => a.index - b.index);

            // Step 5: Generate summary of dropped messages
            const droppedMessages = middleMessages.filter(
                m => !importantMiddle.includes(m)
            );

            let compactedMessages = uniqueKept.map(({ role, content }) => ({ role, content }));

            if (droppedMessages.length > 0) {
                const summary = this.generateSummary(droppedMessages);
                // Insert summary after anchor
                compactedMessages.splice(1, 0, {
                    role: 'system',
                    content: summary
                });
            }

            return { messages: compactedMessages, wasSummarized: droppedMessages.length > 0 };
        }

        generateSummary(droppedMessages) {
            const topics = new Set();
            const hasCode = droppedMessages.some(m => /```/.test(m.content || ''));

            droppedMessages.forEach(m => {
                const content = m.content || '';
                const matches = content.match(/\b(spock|replication|cluster|node|database|table|schema|backup|restore|install|config|ace|pgedge|postgres)/gi);
                if (matches) {
                    matches.forEach(t => topics.add(t.toLowerCase()));
                }
            });

            const topicList = topics.size > 0 ? Array.from(topics).join(', ') : 'various topics';
            return `[Earlier conversation summary: Discussed ${topicList}${hasCode ? ' with code examples' : ''}. ${droppedMessages.length} messages compressed.]`;
        }
    }

    // =========================================================================
    // ChatHistory - Manages localStorage persistence
    // =========================================================================
    class ChatHistory {
        constructor(config = CONFIG) {
            this.storageKey = config.storage.messages;
            this.inputHistoryKey = config.storage.inputHistory;
            this.historySize = config.ui.historySize;
            this.compactor = new Compactor(config.compaction);
        }

        load() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (!stored) return [];

                const messages = JSON.parse(stored);

                // Validate loaded messages - filter out any corrupt entries
                if (!Array.isArray(messages)) {
                    console.warn('[Ellie] Invalid chat history format, clearing');
                    this.clear();
                    return [];
                }

                return messages.filter(msg => {
                    const valid = msg &&
                        typeof msg === 'object' &&
                        typeof msg.role === 'string' &&
                        typeof msg.content === 'string' &&
                        ['user', 'assistant', 'system'].includes(msg.role);
                    if (!valid) {
                        console.warn('[Ellie] Filtering invalid message:', msg);
                    }
                    return valid;
                });
            } catch (e) {
                console.error('[Ellie] Failed to load chat history:', e);
                this.clear(); // Clear corrupt data
                return [];
            }
        }

        save(messages) {
            try {
                const { messages: compacted } = this.compactor.compact(messages);
                localStorage.setItem(this.storageKey, JSON.stringify(compacted));
                return compacted;
            } catch (e) {
                console.error('[Ellie] Failed to save chat history:', e);
            }
            return messages;
        }

        clear() {
            localStorage.removeItem(this.storageKey);
        }

        loadInputHistory() {
            try {
                const stored = localStorage.getItem(this.inputHistoryKey);
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                return [];
            }
        }

        saveInputHistory(history) {
            try {
                const trimmed = history.slice(-this.historySize);
                localStorage.setItem(this.inputHistoryKey, JSON.stringify(trimmed));
            } catch (e) {
                console.error('[Ellie] Failed to save input history:', e);
            }
        }

        addToInputHistory(input) {
            if (!input.trim()) return;
            const history = this.loadInputHistory();
            if (history[history.length - 1] !== input) {
                history.push(input);
                this.saveInputHistory(history);
            }
        }
    }

    // =========================================================================
    // ChatAPI - Handles streaming SSE requests to RAG server
    // =========================================================================
    class ChatAPI {
        constructor(config = CONFIG) {
            this.config = config;
            this.abortController = null;
        }

        getEndpoint() {
            return `${this.getBaseUrl()}/v1/pipelines/${this.config.api.pipelineName}`;
        }

        async streamQuery(query, messages, onChunk, onDone, onError) {
            this.abort();
            this.abortController = new AbortController();
            const signal = this.abortController.signal;

            try {
                const response = await fetch(this.getEndpoint(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream'
                    },
                    body: JSON.stringify({
                        query: query,
                        stream: true,
                        messages: messages
                    }),
                    signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('No response body');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        if (buffer.trim()) {
                            this.processSSELine(buffer, onChunk, onDone, onError);
                        }
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });

                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        this.processSSELine(line, onChunk, onDone, onError);
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }
                onError(error);
            } finally {
                this.abortController = null;
            }
        }

        processSSELine(line, onChunk, onDone, onError) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) return;

            try {
                const data = JSON.parse(trimmed.slice(6));

                switch (data.type) {
                    case 'chunk':
                        if (data.content) {
                            onChunk(data.content);
                        }
                        break;
                    case 'done':
                        onDone();
                        break;
                    case 'error':
                        onError(new Error(data.error || 'Unknown server error'));
                        break;
                }
            } catch (e) {
                console.error('[Ellie] Failed to parse SSE:', trimmed, e);
            }
        }

        abort() {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        }

        isStreaming() {
            return this.abortController !== null;
        }

        async checkHealth() {
            const baseUrl = this.getBaseUrl();
            const healthUrl = `${baseUrl}/v1/health`;

            try {
                const response = await fetch(healthUrl, {
                    method: 'GET',
                    signal: AbortSignal.timeout(this.config.api.healthCheckTimeout)
                });
                return response.ok;
            } catch (e) {
                return false;
            }
        }

        getBaseUrl() {
            const isDev = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
            return isDev ? this.config.api.development : this.config.api.production;
        }
    }

    // =========================================================================
    // ChatUI - Creates and manages DOM elements
    // =========================================================================
    class ChatUI {
        constructor(config = CONFIG) {
            this.config = config;
            this.elements = {};
            this.inputHistoryIndex = -1;
            this.inputHistoryCache = [];
            this.currentInput = '';
        }

        create() {
            // FAB
            this.elements.fab = this.createElement('button', {
                className: 'ellie-fab',
                'aria-label': 'Open Ask Ellie chat',
                title: 'Ask Ellie',
                innerHTML: this.getIconSVG('chat')
            });

            // Chat Window
            this.elements.window = this.createElement('div', {
                className: 'ellie-window',
                'aria-hidden': 'true'
            });

            // Header
            this.elements.header = this.createElement('div', {
                className: 'ellie-header',
                innerHTML: `
                    <div class="ellie-header__info">
                        <span class="ellie-header__avatar">${this.getIconSVG('bot')}</span>
                        <span class="ellie-header__title">Ask Ellie</span>
                    </div>
                    <div class="ellie-header__actions">
                        <button class="ellie-header__btn ellie-header__btn--save"
                                aria-label="Save conversation" title="Save conversation">
                            ${this.getIconSVG('save')}
                        </button>
                        <button class="ellie-header__btn ellie-header__btn--clear"
                                aria-label="Clear conversation" title="Clear conversation">
                            ${this.getIconSVG('trash')}
                        </button>
                        <button class="ellie-header__btn ellie-header__btn--close"
                                aria-label="Close chat" title="Close chat">
                            ${this.getIconSVG('close')}
                        </button>
                    </div>
                `
            });

            // Messages Container
            this.elements.messages = this.createElement('div', {
                className: 'ellie-messages',
                role: 'log',
                'aria-live': 'polite'
            });

            // Input Area
            this.elements.inputArea = this.createElement('div', {
                className: 'ellie-input-area'
            });

            this.elements.input = this.createElement('textarea', {
                className: 'ellie-input',
                placeholder: 'Ask about PostgreSQL or pgEdge...',
                rows: '1',
                'aria-label': 'Chat input'
            });

            this.elements.sendBtn = this.createElement('button', {
                className: 'ellie-send-btn',
                'aria-label': 'Send message',
                innerHTML: this.getIconSVG('send')
            });

            // Disclaimer
            this.elements.disclaimer = this.createElement('div', {
                className: 'ellie-disclaimer',
                innerHTML: 'AI can make mistakes. Please verify important information.'
            });

            // Assemble input area
            this.elements.inputArea.appendChild(this.elements.input);
            this.elements.inputArea.appendChild(this.elements.sendBtn);
            this.elements.inputArea.appendChild(this.elements.disclaimer);

            // Resize handle (top-left corner)
            this.elements.resizeHandle = this.createElement('div', {
                className: 'ellie-resize-handle',
                'aria-hidden': 'true'
            });

            // Assemble window
            this.elements.window.appendChild(this.elements.resizeHandle);
            this.elements.window.appendChild(this.elements.header);
            this.elements.window.appendChild(this.elements.messages);
            this.elements.window.appendChild(this.elements.inputArea);

            // Add to body
            document.body.appendChild(this.elements.fab);
            document.body.appendChild(this.elements.window);

            // Cache button references
            this.elements.saveBtn = this.elements.header.querySelector('.ellie-header__btn--save');
            this.elements.clearBtn = this.elements.header.querySelector('.ellie-header__btn--clear');
            this.elements.closeBtn = this.elements.header.querySelector('.ellie-header__btn--close');

            // Restore saved size
            this.restoreSize();
        }

        restoreSize() {
            const savedWidth = localStorage.getItem('ellie_chat_width');
            const savedHeight = localStorage.getItem('ellie_chat_height');
            if (savedWidth) {
                this.elements.window.style.width = savedWidth + 'px';
            }
            if (savedHeight) {
                this.elements.window.style.height = savedHeight + 'px';
            }
        }

        saveSize() {
            const rect = this.elements.window.getBoundingClientRect();
            localStorage.setItem('ellie_chat_width', Math.round(rect.width));
            localStorage.setItem('ellie_chat_height', Math.round(rect.height));
        }

        createElement(tag, props = {}) {
            const el = document.createElement(tag);
            Object.entries(props).forEach(([key, value]) => {
                if (key === 'className') {
                    el.className = value;
                } else if (key === 'innerHTML') {
                    // Safe: innerHTML values are either hardcoded SVG icons or
                    // content that has been HTML-escaped via renderMarkdown()
                    // nosemgrep: javascript.browser.security.innerHTML.property-assignment
                    el.innerHTML = value; // eslint-disable-line xss/no-mixed-html
                } else {
                    el.setAttribute(key, value);
                }
            });
            return el;
        }

        // Static SVG icons - safe hardcoded HTML, not user input
        /* eslint-disable xss/no-mixed-html */
        getIconSVG(name) {
            const icons = {
                chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
                close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
                stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>',
                trash: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
                save: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
                bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13zm9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5zM12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z"/></svg>'
            };
            return icons[name] || '';
        }
        /* eslint-enable xss/no-mixed-html */

        showFab() {
            this.elements.fab.classList.add('ellie-fab--visible');
        }

        hideFab() {
            this.elements.fab.classList.remove('ellie-fab--visible');
        }

        toggle() {
            const isOpen = this.elements.window.classList.toggle('ellie-window--open');
            if (isOpen) {
                this.hideFab();
            } else {
                this.showFab();
            }
            this.elements.window.setAttribute('aria-hidden', !isOpen);

            if (isOpen) {
                this.elements.input.focus();
                this.scrollToBottom();
            }

            return isOpen;
        }

        open() {
            this.elements.window.classList.add('ellie-window--open');
            this.hideFab();
            this.elements.window.setAttribute('aria-hidden', 'false');
            this.elements.input.focus();
            this.scrollToBottom();
        }

        close() {
            this.elements.window.classList.remove('ellie-window--open');
            this.showFab();
            this.elements.window.setAttribute('aria-hidden', 'true');
        }

        addMessage(role, content, isStreaming = false) {
            const msgEl = this.createElement('div', {
                className: `ellie-message ellie-message--${role}${isStreaming ? ' ellie-message--streaming' : ''}`
            });

            const contentEl = this.createElement('div', {
                className: 'ellie-message__content'
            });

            if (role === 'assistant') {
                // Safe: renderMarkdown() escapes all HTML before converting markdown to safe tags
                // nosemgrep: javascript.browser.security.innerHTML.property-assignment
                contentEl.innerHTML = this.renderMarkdown(content); // eslint-disable-line xss/no-mixed-html
                // Apply syntax highlighting for completed messages
                if (!isStreaming) {
                    this.highlightCode(contentEl);
                }
            } else {
                contentEl.textContent = content;
            }

            msgEl.appendChild(contentEl);
            this.elements.messages.appendChild(msgEl);
            this.scrollToBottom();

            return { message: msgEl, content: contentEl };
        }

        updateStreamingMessage(contentEl, content, hasPendingCode = false) {
            // Safe: renderMarkdown() escapes all HTML before converting markdown to safe tags
            // nosemgrep: javascript.browser.security.innerHTML.property-assignment
            contentEl.innerHTML = this.renderMarkdown(content, hasPendingCode); // eslint-disable-line xss/no-mixed-html
            this.scrollToBottom();
        }

        finalizeStreamingMessage(msgEl, contentEl) {
            msgEl.classList.remove('ellie-message--streaming');
            // Apply syntax highlighting to completed code blocks
            this.highlightCode(contentEl);
        }

        /**
         * Apply syntax highlighting to code blocks if highlight.js is available.
         */
        highlightCode(container) {
            if (typeof hljs !== 'undefined') {
                container.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }
            this.addCopyButtons(container);
        }

        /**
         * Add copy buttons to code blocks.
         */
        addCopyButtons(container) {
            container.querySelectorAll('pre.ellie-code').forEach(pre => {
                // Skip if already has a copy button
                if (pre.querySelector('.ellie-copy-btn')) return;

                const btn = document.createElement('button');
                btn.className = 'ellie-copy-btn';
                btn.textContent = 'Copy';
                btn.addEventListener('click', () => {
                    const code = pre.querySelector('code');
                    if (code) {
                        navigator.clipboard.writeText(code.textContent).then(() => {
                            btn.textContent = 'Copied!';
                            btn.classList.add('ellie-copy-btn--copied');
                            setTimeout(() => {
                                btn.textContent = 'Copy';
                                btn.classList.remove('ellie-copy-btn--copied');
                            }, 1500);
                        });
                    }
                });
                pre.appendChild(btn);
            });
        }

        renderMarkdown(text, hasPendingCode = false) {
            if (!text) return '';

            let processText = text;

            // If there's a pending (incomplete) code block, temporarily close it for rendering
            if (hasPendingCode) {
                processText += '\n```';
            }

            // Escape HTML first
            let html = processText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Extract code blocks and replace with placeholders to protect them
            // from newline-to-<br> conversion (highlight.js needs real newlines)
            const codeBlocks = [];
            html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code, offset) => {
                const index = codeBlocks.length;
                const isPending = hasPendingCode && !html.slice(offset + match.length).includes('```');
                const pendingClass = isPending ? ' ellie-code--pending' : '';
                // Store the code block HTML with actual newlines preserved
                codeBlocks.push(`<pre class="ellie-code${pendingClass}"><code class="language-${lang}">${code}</code></pre>`);
                return `\x00CODE_BLOCK_${index}\x00`;
            });

            // Process other markdown (this will convert \n to <br> but not inside placeholders)
            html = html
                // Headings (process longest patterns first)
                .replace(/^##### (.+)$/gm, '<h6>$1</h6>')
                .replace(/^#### (.+)$/gm, '<h5>$1</h5>')
                .replace(/^### (.+)$/gm, '<h4>$1</h4>')
                .replace(/^## (.+)$/gm, '<h3>$1</h3>')
                .replace(/^# (.+)$/gm, '<h2>$1</h2>')
                // Unordered lists
                .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
                // Ordered lists
                .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
                // Inline code
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                // Bold
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                // Italic
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                // Links (validate URL and escape for attribute context)
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
                    if (/^(https?:\/\/|mailto:|\/)/i.test(url)) {
                        // Escape URL for href attribute (quotes could break out)
                        const safeUrl = url.replace(/"/g, '&quot;');
                        return `<a href="${safeUrl}" target="_blank" rel="noopener">${linkText}</a>`;
                    }
                    return match;
                })
                // Wrap consecutive <li> in <ul> (non-greedy to prevent ReDoS)
                .replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>')
                // Line breaks (but not after block elements or inside code block placeholders)
                .replace(/\n(?!<)/g, '<br>')
                // Clean up extra <br> after block elements
                .replace(/(<\/(?:h[2-6]|ul|pre|li)>)<br>/g, '$1');

            // Restore code blocks (with real newlines preserved)
            html = html.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_match, index) => {
                return codeBlocks[parseInt(index, 10)];
            });

            // Clean up <br> before/after code blocks (placeholders weren't treated as block elements)
            html = html.replace(/<br>(<pre)/g, '$1');
            html = html.replace(/(<\/pre>)<br>/g, '$1');

            return html;
        }

        scrollToBottom() {
            requestAnimationFrame(() => {
                this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            });
        }

        clearMessages() {
            // Safe: setting to empty string to clear container
            // nosemgrep: javascript.browser.security.innerHTML.property-assignment
            this.elements.messages.innerHTML = ''; // eslint-disable-line xss/no-mixed-html
            this.addWelcomeMessage();
        }

        addWelcomeMessage() {
            this.addMessage('assistant',
                "Hi! I'm Ellie, your pgEdge documentation assistant built on pgEdge. " +
                "Ask me anything about PostgreSQL, pgEdge, and the PostgreSQL extensions and tools we support."
            );
        }

        setStreaming(isStreaming) {
            // Safe: getIconSVG() returns hardcoded SVG strings, not user input
            // nosemgrep: javascript.browser.security.innerHTML.property-assignment
            // eslint-disable-next-line xss/no-mixed-html
            this.elements.sendBtn.innerHTML = isStreaming ?
                this.getIconSVG('stop') :
                this.getIconSVG('send');
            this.elements.sendBtn.setAttribute('aria-label',
                isStreaming ? 'Stop generation' : 'Send message');
            this.elements.sendBtn.classList.toggle('ellie-send-btn--stop', isStreaming);
        }

        getInput() {
            return this.elements.input.value.trim();
        }

        clearInput() {
            this.elements.input.value = '';
            this.autoResizeInput();
        }

        autoResizeInput() {
            const input = this.elements.input;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, this.config.ui.maxInputHeight) + 'px';
        }

        navigateHistory(direction, history) {
            if (history.length === 0) return;

            if (this.inputHistoryIndex === -1) {
                this.currentInput = this.elements.input.value;
                this.inputHistoryCache = history.slice();
            }

            if (direction === 'up') {
                if (this.inputHistoryIndex < this.inputHistoryCache.length - 1) {
                    this.inputHistoryIndex++;
                }
            } else {
                if (this.inputHistoryIndex > -1) {
                    this.inputHistoryIndex--;
                }
            }

            if (this.inputHistoryIndex === -1) {
                this.elements.input.value = this.currentInput;
            } else {
                const historyIndex = this.inputHistoryCache.length - 1 - this.inputHistoryIndex;
                this.elements.input.value = this.inputHistoryCache[historyIndex];
            }

            this.autoResizeInput();
        }

        resetHistoryNavigation() {
            this.inputHistoryIndex = -1;
            this.inputHistoryCache = [];
            this.currentInput = '';
        }

        showError(message) {
            this.addMessage('assistant', `**Error:** ${message}`);
        }

        showBusyStatus(message) {
            if (!this.elements.busyStatus) {
                this.elements.busyStatus = this.createElement('div', {
                    className: 'ellie-busy-status'
                });
            }
            this.elements.busyStatus.textContent = message;
            if (!this.elements.busyStatus.parentNode) {
                this.elements.messages.appendChild(this.elements.busyStatus);
            }
            this.scrollToBottom();
        }

        hideBusyStatus() {
            if (this.elements.busyStatus && this.elements.busyStatus.parentNode) {
                this.elements.busyStatus.remove();
            }
        }
    }

    // =========================================================================
    // ChatApp - Main orchestrator class
    // =========================================================================
    class ChatApp {
        constructor(config = CONFIG) {
            this.config = config;
            this.ui = new ChatUI(config);
            this.api = new ChatAPI(config);
            this.history = new ChatHistory(config);
            this.messages = [];
            this.fullHistory = [];  // Uncompacted history for exports
            this.streamBuffer = new StreamBuffer();
            this.currentStreamElements = null;
            this.initialized = false;
            this.busyMessageTimer = null;
            this.busyMessageIndex = 0;
            this.resizeState = null;
        }

        async init() {
            // Don't reinitialize if already created
            if (document.querySelector('.ellie-fab')) {
                return;
            }

            // Create UI (FAB hidden by default)
            this.ui.create();

            // Check if RAG server is accessible
            const isServerAvailable = await this.api.checkHealth();
            if (!isServerAvailable) {
                return;
            }

            // Load existing messages
            this.messages = this.history.load();
            this.loadFullHistory();
            this.renderExistingMessages();

            // Bind events
            this.bindEvents();

            // Restore open state - default to open for new users
            const savedOpenState = localStorage.getItem(this.config.storage.isOpen);
            const shouldOpen = savedOpenState === null || savedOpenState === 'true';

            if (shouldOpen) {
                this.ui.showFab(); // Show first so close() works correctly
                this.ui.open();
            } else {
                this.ui.showFab();
            }

            this.initialized = true;
        }

        bindEvents() {
            // FAB click
            this.ui.elements.fab.addEventListener('click', () => this.handleToggle());

            // Close button
            this.ui.elements.closeBtn.addEventListener('click', () => this.handleClose());

            // Save button
            this.ui.elements.saveBtn.addEventListener('click', () => this.handleSave());

            // Clear button
            this.ui.elements.clearBtn.addEventListener('click', () => this.handleClear());

            // Send button
            this.ui.elements.sendBtn.addEventListener('click', () => this.handleSendOrStop());

            // Input events
            this.ui.elements.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
            this.ui.elements.input.addEventListener('input', () => this.ui.autoResizeInput());

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.ui.elements.window.classList.contains('ellie-window--open')) {
                    this.handleClose();
                }
            });

            // Resize handle
            this.ui.elements.resizeHandle.addEventListener('mousedown', (e) => this.handleResizeStart(e));
        }

        handleResizeStart(e) {
            e.preventDefault();
            const win = this.ui.elements.window;
            const rect = win.getBoundingClientRect();

            // Store initial state
            this.resizeState = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: rect.width,
                startHeight: rect.height
            };

            win.classList.add('ellie-window--resizing');

            // Bind move and up handlers
            this.boundHandleResizeMove = (e) => this.handleResizeMove(e);
            this.boundHandleResizeEnd = () => this.handleResizeEnd();

            document.addEventListener('mousemove', this.boundHandleResizeMove);
            document.addEventListener('mouseup', this.boundHandleResizeEnd);
        }

        handleResizeMove(e) {
            if (!this.resizeState) return;

            const win = this.ui.elements.window;

            // Calculate delta (negative because dragging left/up should increase size)
            const deltaX = this.resizeState.startX - e.clientX;
            const deltaY = this.resizeState.startY - e.clientY;

            // Calculate new size with constraints
            const minWidth = 300;
            const minHeight = 350;
            const maxWidth = window.innerWidth - 48;
            const maxHeight = window.innerHeight - 100;

            const newWidth = Math.min(maxWidth, Math.max(minWidth, this.resizeState.startWidth + deltaX));
            const newHeight = Math.min(maxHeight, Math.max(minHeight, this.resizeState.startHeight + deltaY));

            win.style.width = newWidth + 'px';
            win.style.height = newHeight + 'px';
        }

        handleResizeEnd() {
            if (!this.resizeState) return;

            this.ui.elements.window.classList.remove('ellie-window--resizing');
            this.ui.saveSize();

            document.removeEventListener('mousemove', this.boundHandleResizeMove);
            document.removeEventListener('mouseup', this.boundHandleResizeEnd);

            this.resizeState = null;
        }

        handleToggle() {
            const isOpen = this.ui.toggle();
            localStorage.setItem(this.config.storage.isOpen, isOpen.toString());
        }

        handleClose() {
            this.ui.close();
            localStorage.setItem(this.config.storage.isOpen, 'false');
        }

        handleClear() {
            if (confirm('Clear conversation history?')) {
                this.messages = [];
                this.fullHistory = [];
                this.history.clear();
                localStorage.removeItem(this.config.storage.fullHistory);
                this.ui.clearMessages();
            }
        }

        loadFullHistory() {
            try {
                const stored = localStorage.getItem(this.config.storage.fullHistory);
                this.fullHistory = stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error('[Ellie] Failed to load full history:', e);
                this.fullHistory = [];
            }
        }

        saveFullHistory() {
            try {
                localStorage.setItem(this.config.storage.fullHistory, JSON.stringify(this.fullHistory));
            } catch (e) {
                console.error('[Ellie] Failed to save full history:', e);
            }
        }

        handleSave() {
            // Filter out system messages and generate markdown from full (uncompacted) history
            const userMessages = this.fullHistory.filter(msg => msg.role !== 'system');

            if (userMessages.length === 0) {
                return;
            }

            // Generate markdown content
            const lines = userMessages.map(msg => {
                const speaker = msg.role === 'user' ? 'User' : 'Ellie';
                return `**${speaker}:** ${msg.content}`;
            });

            const markdown = lines.join('\n\n');

            // Generate filename with current date
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const filename = `ellie-chat-${year}-${month}-${day}.md`;

            // Create and trigger download
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        handleSendOrStop() {
            if (this.api.isStreaming()) {
                this.api.abort();
                this.finalizeCurrentStream();
            } else {
                this.sendMessage();
            }
        }

        handleInputKeydown(e) {
            // Send on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
                return;
            }

            // History navigation
            const input = this.ui.elements.input;
            const isNavigatingHistory = this.ui.inputHistoryIndex > -1;

            // Up arrow: navigate to older history when at start of text, or continue if already navigating
            if (e.key === 'ArrowUp' && (isNavigatingHistory || input.selectionStart === 0)) {
                e.preventDefault();
                this.ui.navigateHistory('up', this.history.loadInputHistory());
                return;
            }

            // Down arrow: navigate to newer history when already navigating, or at end of text
            if (e.key === 'ArrowDown' && (isNavigatingHistory || input.selectionStart === input.value.length)) {
                e.preventDefault();
                this.ui.navigateHistory('down', this.history.loadInputHistory());
                return;
            }

            // Reset history navigation on other input
            this.ui.resetHistoryNavigation();
        }

        sendMessage() {
            const content = this.ui.getInput();
            if (!content || this.api.isStreaming()) return;

            // Add to input history
            this.history.addToInputHistory(content);
            this.ui.resetHistoryNavigation();

            // Add user message
            this.messages.push({ role: 'user', content });
            this.fullHistory.push({ role: 'user', content });
            this.saveFullHistory();
            this.ui.addMessage('user', content);
            this.ui.clearInput();

            // Start streaming response
            this.startStream(content);
        }

        startStream(query) {
            this.ui.setStreaming(true);
            this.streamBuffer.reset();
            this.currentStreamElements = null;

            // Start showing busy messages
            this.startBusyMessages();

            // Prepare messages for API (exclude current query, it goes in query field)
            const contextMessages = this.messages.slice(0, -1);

            this.api.streamQuery(
                query,
                contextMessages,
                // onChunk
                (chunk) => {
                    // Hide busy messages once content starts arriving
                    if (!this.currentStreamElements) {
                        this.stopBusyMessages();
                        this.currentStreamElements = this.ui.addMessage('assistant', '', true);
                    }
                    // Buffer handles word boundaries and tracks pending code blocks
                    const { content, hasPendingCode } = this.streamBuffer.add(chunk);
                    this.ui.updateStreamingMessage(
                        this.currentStreamElements.content,
                        content,
                        hasPendingCode
                    );
                },
                // onDone
                () => {
                    this.finalizeCurrentStream();
                },
                // onError
                (error) => {
                    console.error('[Ellie] Stream error:', error);
                    this.stopBusyMessages();

                    // Provide helpful error messages based on error type
                    let errorMsg = error.message || 'Failed to get response.';
                    if (errorMsg === 'Load failed' || errorMsg === 'Failed to fetch' || error.name === 'TypeError') {
                        errorMsg = 'Network error. Please check your connection and try again. If the problem persists, try clearing the conversation (trash icon).';
                    } else if (errorMsg.includes('413') || errorMsg.includes('too large')) {
                        errorMsg = 'Conversation too long. Please clear the conversation (trash icon) and try again.';
                    }

                    this.ui.showError(errorMsg);
                    this.ui.setStreaming(false);
                    this.streamBuffer.reset();
                    if (this.currentStreamElements) {
                        this.currentStreamElements.message.remove();
                        this.currentStreamElements = null;
                    }
                }
            );
        }

        startBusyMessages() {
            // Pick a random starting message
            this.busyMessageIndex = Math.floor(Math.random() * this.config.busyMessages.length);
            this.ui.showBusyStatus(this.config.busyMessages[this.busyMessageIndex]);

            // Rotate messages every few seconds
            this.busyMessageTimer = setInterval(() => {
                this.busyMessageIndex = (this.busyMessageIndex + 1) % this.config.busyMessages.length;
                this.ui.showBusyStatus(this.config.busyMessages[this.busyMessageIndex]);
            }, this.config.ui.busyMessageInterval);
        }

        stopBusyMessages() {
            if (this.busyMessageTimer) {
                clearInterval(this.busyMessageTimer);
                this.busyMessageTimer = null;
            }
            this.ui.hideBusyStatus();
        }

        finalizeCurrentStream() {
            this.stopBusyMessages();

            if (this.currentStreamElements) {
                // Display the full content (flush any buffered text/code blocks)
                const fullContent = this.streamBuffer.getFullContent();
                this.ui.updateStreamingMessage(
                    this.currentStreamElements.content,
                    fullContent,
                    false  // No pending code - stream is complete
                );
                this.ui.finalizeStreamingMessage(
                    this.currentStreamElements.message,
                    this.currentStreamElements.content
                );

                // Add assistant message to history
                if (fullContent) {
                    this.messages.push({ role: 'assistant', content: fullContent });
                    this.fullHistory.push({ role: 'assistant', content: fullContent });
                    this.saveFullHistory();
                    this.messages = this.history.save(this.messages);
                }

                this.currentStreamElements = null;
                this.streamBuffer.reset();
            }

            this.ui.setStreaming(false);
        }

        renderExistingMessages() {
            // Display from fullHistory so users see complete conversation
            // (this.messages may be compacted for API context)
            if (this.fullHistory.length === 0) {
                this.ui.addWelcomeMessage();
            } else {
                this.fullHistory.forEach(msg => {
                    // Skip system messages in display
                    if (msg.role !== 'system') {
                        this.ui.addMessage(msg.role, msg.content);
                    }
                });
            }
        }
    }

    // =========================================================================
    // Initialization
    // =========================================================================
    let app = null;

    function init() {
        if (!app) {
            app = new ChatApp();
        }
        app.init();
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize after instant navigation (MkDocs Material)
    // document$ is a global RxJS observable provided by MkDocs Material for instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(init); // eslint-disable-line no-undef
    }

    // Export for external access if needed
    window.EllieChat = ChatApp;
})();
