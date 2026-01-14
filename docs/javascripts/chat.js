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
            inputHistory: 'ellie_input_history',
            isOpen: 'ellie_chat_open'
        }
    };

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

            // Remove duplicates based on index
            const seen = new Set();
            const uniqueKept = kept.filter(m => {
                if (seen.has(m.index)) return false;
                seen.add(m.index);
                return true;
            });

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
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error('[Ellie] Failed to load chat history:', e);
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
                        messages: messages,
                        include_sources: false
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
                placeholder: 'Ask about pgEdge...',
                rows: '1',
                'aria-label': 'Chat input'
            });

            this.elements.sendBtn = this.createElement('button', {
                className: 'ellie-send-btn',
                'aria-label': 'Send message',
                innerHTML: this.getIconSVG('send')
            });

            // Assemble input area
            this.elements.inputArea.appendChild(this.elements.input);
            this.elements.inputArea.appendChild(this.elements.sendBtn);

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
                    el.innerHTML = value;
                } else {
                    el.setAttribute(key, value);
                }
            });
            return el;
        }

        getIconSVG(name) {
            const icons = {
                chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
                close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
                stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>',
                trash: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
                bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13zm9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5zM12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z"/></svg>'
            };
            return icons[name] || '';
        }

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
                contentEl.innerHTML = this.renderMarkdown(content);
            } else {
                contentEl.textContent = content;
            }

            msgEl.appendChild(contentEl);
            this.elements.messages.appendChild(msgEl);
            this.scrollToBottom();

            return { message: msgEl, content: contentEl };
        }

        updateStreamingMessage(contentEl, fullContent) {
            contentEl.innerHTML = this.renderMarkdown(fullContent);
            this.scrollToBottom();
        }

        finalizeStreamingMessage(msgEl) {
            msgEl.classList.remove('ellie-message--streaming');
        }

        renderMarkdown(text) {
            if (!text) return '';

            // Escape HTML first
            let html = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            return html
                // Code blocks (must be before other replacements)
                .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
                // Headings (## and ###)
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
                // Line breaks (but not after block elements)
                .replace(/\n(?!<)/g, '<br>')
                // Clean up extra <br> after block elements
                .replace(/(<\/(?:h[2-4]|ul|pre|li)>)<br>/g, '$1');
        }

        scrollToBottom() {
            requestAnimationFrame(() => {
                this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            });
        }

        clearMessages() {
            this.elements.messages.innerHTML = '';
            this.addWelcomeMessage();
        }

        addWelcomeMessage() {
            this.addMessage('assistant',
                "Hi! I'm Ellie, your pgEdge documentation assistant. " +
                "Ask me anything about pgEdge products, installation, configuration, or troubleshooting."
            );
        }

        setStreaming(isStreaming) {
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
            this.currentStreamContent = '';
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
            this.renderExistingMessages();

            // Bind events
            this.bindEvents();

            // Restore open state if configured, otherwise just show FAB
            if (localStorage.getItem(this.config.storage.isOpen) === 'true') {
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
                this.history.clear();
                this.ui.clearMessages();
            }
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
            if (e.key === 'ArrowUp' && this.ui.elements.input.selectionStart === 0) {
                e.preventDefault();
                this.ui.navigateHistory('up', this.history.loadInputHistory());
                return;
            }

            if (e.key === 'ArrowDown') {
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
            this.ui.addMessage('user', content);
            this.ui.clearInput();

            // Start streaming response
            this.startStream(content);
        }

        startStream(query) {
            this.ui.setStreaming(true);
            this.currentStreamContent = '';
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
                    this.currentStreamContent += chunk;
                    this.ui.updateStreamingMessage(
                        this.currentStreamElements.content,
                        this.currentStreamContent
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
                    this.ui.showError(error.message || 'Failed to get response. Please try again.');
                    this.ui.setStreaming(false);
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
                this.ui.finalizeStreamingMessage(this.currentStreamElements.message);

                // Add assistant message to history
                if (this.currentStreamContent) {
                    this.messages.push({ role: 'assistant', content: this.currentStreamContent });
                    this.messages = this.history.save(this.messages);
                }

                this.currentStreamElements = null;
                this.currentStreamContent = '';
            }

            this.ui.setStreaming(false);
        }

        renderExistingMessages() {
            if (this.messages.length === 0) {
                this.ui.addWelcomeMessage();
            } else {
                this.messages.forEach(msg => {
                    // Skip system messages (summaries) in display
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
    if (typeof document$ !== 'undefined') {
        document$.subscribe(init);
    }

    // Export for external access if needed
    window.EllieChat = ChatApp;
})();
