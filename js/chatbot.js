/* =========================================================
   AAISH PORTFOLIO — AI CHATBOT WIDGET

   TO UPDATE WORKER URL: change WORKER_URL constant below.
   All other configuration is in the Cloudflare Worker.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIGURATION — edit these values if anything changes
  --------------------------------------------------------- */
  const WORKER_URL   = 'https://aaish-chat.aaishaashu2626.workers.dev';
  const OPEN_DELAY   = 3000;   // ms before notification bubble appears
  const NOTIF_DURATION = 6000; // ms notification bubble stays visible
  const SEND_COOLDOWN  = 1500; // ms between messages (prevent spam)

  const STARTER_CHIPS = [
    'Tell me about your AI projects',
    'Are you open to Gulf roles?',
    "What's your strongest skill?",
  ];

  const WELCOME_MESSAGE =
    "Hi! 👋 I'm Aaish's AI assistant. Ask me anything about " +
    'my experience, projects, skills, or how to get in touch.';

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  let isOpen           = false;
  let isThinking       = false;
  let chipsUsed        = false;
  let lastSendTime     = 0;
  let conversationHistory = [];

  /* ---------------------------------------------------------
     BUILD HTML STRUCTURE
  --------------------------------------------------------- */
  function buildWidget() {
    const widget = document.createElement('div');
    widget.id = 'aaish-chat-widget';
    widget.innerHTML = `

      <!-- Notification bubble -->
      <div id="chat-notif" class="chat-notif" aria-hidden="true">
        👋 Ask me anything!
      </div>

      <!-- Floating trigger button -->
      <button
        id="chat-trigger"
        class="chat-trigger"
        aria-label="Open AI chat assistant"
        title="Ask Aaish's AI"
      >
        <div class="trigger-ring"></div>
        <svg class="trigger-icon-bot" viewBox="0 0 24 24"
             fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg class="trigger-icon-close" viewBox="0 0 24 24"
             fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="trigger-pulse"></span>
      </button>

      <!-- Chat window -->
      <div id="chat-window" class="chat-window"
           role="dialog" aria-label="Aaish AI chat assistant"
           aria-hidden="true">

        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-avatar">
              <span>AI</span>
            </div>
            <div class="chat-header-text">
              <span class="chat-title">Ask Aaish's AI</span>
              <span class="chat-status">
                <span class="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <button id="chat-close" class="chat-close-btn"
                  aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages area -->
        <div id="chat-messages" class="chat-messages"
             role="log" aria-live="polite">
        </div>

        <!-- Starter chips -->
        <div id="chat-chips" class="chat-chips">
          ${STARTER_CHIPS.map(chip => `
            <button class="chat-chip" data-msg="${chip}">
              ${chip}
            </button>
          `).join('')}
        </div>

        <!-- Input area -->
        <div class="chat-input-area">
          <input
            id="chat-input"
            class="chat-input"
            type="text"
            placeholder="Ask me anything..."
            autocomplete="off"
            maxlength="300"
            aria-label="Type your message"
          />
          <button id="chat-send" class="chat-send-btn"
                  aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="chat-footer">
          Powered by Llama 3.3 · Groq · Cloudflare
        </div>
      </div>
    `;
    document.body.appendChild(widget);
  }

  /* ---------------------------------------------------------
     MESSAGE RENDERING
  --------------------------------------------------------- */
  function addMessage(role, text, isStreaming = false) {
    const messages = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = `chat-msg chat-msg--${role}`;

    if (role === 'assistant') {
      wrap.innerHTML = `
        <div class="msg-avatar">AI</div>
        <div class="msg-bubble" id="${isStreaming ? 'streaming-bubble' : ''}">
          ${isStreaming ? '' : escapeHtml(text)}
        </div>
      `;
    } else {
      wrap.innerHTML = `
        <div class="msg-bubble">${escapeHtml(text)}</div>
      `;
    }

    messages.appendChild(wrap);
    scrollToBottom();
    return wrap.querySelector('.msg-bubble');
  }

  function showTypingIndicator() {
    const messages = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--assistant';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <div class="msg-avatar">AI</div>
      <div class="msg-bubble typing-bubble">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    messages.appendChild(wrap);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    const messages = document.getElementById('chat-messages');
    messages.scrollTop = messages.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     SEND MESSAGE & STREAM RESPONSE
  --------------------------------------------------------- */
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isThinking) return;

    const now = Date.now();
    if (now - lastSendTime < SEND_COOLDOWN) return;
    lastSendTime = now;

    // Hide chips after first message
    if (!chipsUsed) {
      chipsUsed = true;
      const chips = document.getElementById('chat-chips');
      if (chips) {
        chips.style.opacity = '0';
        chips.style.height = '0';
        chips.style.padding = '0';
        chips.style.margin = '0';
        chips.style.overflow = 'hidden';
        chips.style.transition = 'all 0.3s ease';
      }
    }

    // Add user message to UI
    addMessage('user', text);

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: text });

    // Clear input
    const input = document.getElementById('chat-input');
    if (input) input.value = '';

    // Show thinking indicator
    isThinking = true;
    setSendState(false);
    showTypingIndicator();

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`Worker error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || '';

      if (!reply) {
        throw new Error('Empty reply from Worker');
      }

      // Display response with typewriter effect
      const bubble = addMessage('assistant', '', true);
      let index = 0;
      const speed = 18;

      function typeChar() {
        if (index < reply.length) {
          bubble.textContent += reply[index];
          index++;
          scrollToBottom();
          setTimeout(typeChar, speed);
        } else {
          // Typing complete
          conversationHistory.push({
            role: 'assistant',
            content: reply,
          });
        }
      }

      typeChar();

    } catch (error) {
      removeTypingIndicator();
      console.error('[Chatbot] Error:', error);
      addMessage(
        'assistant',
        "I'm having trouble connecting right now. " +
        'Please reach out to Aaish directly on WhatsApp: +92 333 0378408.'
      );
    } finally {
      isThinking = false;
      setSendState(true);
      const inputEl = document.getElementById('chat-input');
      if (inputEl) inputEl.focus();
    }
  }

  /* ---------------------------------------------------------
     OPEN / CLOSE
  --------------------------------------------------------- */
  function openChat() {
    isOpen = true;
    const win = document.getElementById('chat-window');
    const btn = document.getElementById('chat-trigger');
    const notif = document.getElementById('chat-notif');

    if (win) {
      win.classList.add('chat-window--open');
      win.setAttribute('aria-hidden', 'false');
    }
    if (btn) btn.classList.add('chat-trigger--open');
    if (notif) notif.classList.remove('chat-notif--visible');

    // Show welcome message on first open
    const messages = document.getElementById('chat-messages');
    if (messages && messages.children.length === 0) {
      setTimeout(() => {
        addMessage('assistant', WELCOME_MESSAGE);
      }, 300);
    }

    setTimeout(() => {
      const input = document.getElementById('chat-input');
      if (input) input.focus();
    }, 400);
  }

  function closeChat() {
    isOpen = false;
    const win = document.getElementById('chat-window');
    const btn = document.getElementById('chat-trigger');

    if (win) {
      win.classList.remove('chat-window--open');
      win.setAttribute('aria-hidden', 'true');
    }
    if (btn) btn.classList.remove('chat-trigger--open');
  }

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  function setSendState(enabled) {
    const btn   = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    if (btn)   btn.disabled   = !enabled;
    if (input) input.disabled = !enabled;
  }

  /* ---------------------------------------------------------
     NOTIFICATION BUBBLE
  --------------------------------------------------------- */
  function showNotification() {
    const notif = document.getElementById('chat-notif');
    if (!notif || isOpen) return;
    notif.classList.add('chat-notif--visible');
    setTimeout(() => {
      notif.classList.remove('chat-notif--visible');
    }, NOTIF_DURATION);
  }

  /* ---------------------------------------------------------
     EVENT BINDING
  --------------------------------------------------------- */
  function bindEvents() {
    // Trigger button
    document.getElementById('chat-trigger')
      .addEventListener('click', () => isOpen ? closeChat() : openChat());

    // Close button
    document.getElementById('chat-close')
      .addEventListener('click', closeChat);

    // Send button
    document.getElementById('chat-send')
      .addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        if (input) sendMessage(input.value);
      });

    // Enter key
    document.getElementById('chat-input')
      .addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const input = document.getElementById('chat-input');
          if (input) sendMessage(input.value);
        }
      });

    // Starter chips
    document.getElementById('chat-chips')
      .addEventListener('click', (e) => {
        const chip = e.target.closest('.chat-chip');
        if (chip) sendMessage(chip.dataset.msg);
      });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const widget = document.getElementById('aaish-chat-widget');
      if (isOpen && widget && !widget.contains(e.target)) {
        closeChat();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeChat();
    });
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function init() {
    buildWidget();
    bindEvents();
    setTimeout(showNotification, OPEN_DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
