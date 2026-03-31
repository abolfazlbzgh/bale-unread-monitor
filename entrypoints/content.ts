import { defineContentScript } from '#imports';
import { browser } from 'wxt/browser';

// Configuration constants for DOM selectors and timings
const CONFIG = {
  selectors: {
    chatItem: '.dialog-item-content',
    userName: '.oUKPfP',
    badge: 'span[aria-label="count-badge-text"]',
    messageEl: '.aqFHpt',
  },
  attributes: {
    messageAttr: 'title',
  },
  keywords: {
    typingEn: 'typing',
    typingFa: 'نوشتن',
  },
  timers: {
    confirmDelay: 3000,
    startupDelay: 3000,
    debounceDelay: 500,
  },
};

interface ChatState {
  lastConfirmedCount: number;
  pendingCount: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export default defineContentScript({
  matches: ['*://web.bale.ai/*'],
  main() {
    const chatStates = new Map<string, ChatState>();

    /**
     * Parses the DOM to extract current chat states
     */
    function getChatData() {
      const chatItems = document.querySelectorAll(CONFIG.selectors.chatItem);
      const data: { name: string; count: number; message: string }[] = [];

      chatItems.forEach((item) => {
        const nameEl = item.querySelector(CONFIG.selectors.userName);
        const name = nameEl ? (nameEl as HTMLElement).innerText.trim() : 'Unknown';

        const badgeSpan = item.querySelector(CONFIG.selectors.badge);
        const count = badgeSpan
          ? parseInt((badgeSpan as HTMLElement).innerText.trim(), 10) || 0
          : 0;

        const messageEl = item.querySelector(CONFIG.selectors.messageEl);
        let message = '';

        if (messageEl) {
          const rawMessage = messageEl.getAttribute(CONFIG.attributes.messageAttr);
          if (rawMessage) {
            const isTyping =
              rawMessage.toLowerCase().includes(CONFIG.keywords.typingEn) ||
              rawMessage.includes(CONFIG.keywords.typingFa);
            if (!isTyping) {
              message = rawMessage;
            }
          }
        }

        if (name !== 'Unknown') {
          data.push({ name, count, message });
        }
      });

      return data;
    }

    /**
     * Evaluates chat data against previous state to trigger notifications
     */
    function scanPage() {
      const currentChats = getChatData();

      currentChats.forEach(({ name, count, message }) => {
        if (!chatStates.has(name)) {
          chatStates.set(name, {
            lastConfirmedCount: count,
            pendingCount: 0,
            timer: null,
          });
          return;
        }

        const state = chatStates.get(name)!;

        // Reset state if messages were read
        if (count <= state.lastConfirmedCount) {
          state.lastConfirmedCount = count;
          if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
            state.pendingCount = 0;
          }
        }
        // Process new incoming messages
        else if (count > state.lastConfirmedCount) {
          if (count !== state.pendingCount) {
            state.pendingCount = count;
            if (state.timer) clearTimeout(state.timer);

            state.timer = setTimeout(() => {
              const freshChats = getChatData();
              const freshData = freshChats.find((c) => c.name === name);
              const finalMessage = freshData ? freshData.message : message;

              const formattedBody = finalMessage
                ? `💬 ${name} (${state.pendingCount} unread):\n${finalMessage}`
                : `💬 ${name} (${state.pendingCount} unread)`;

              // Dispatch notification payload to background script
              browser.runtime.sendMessage({
                action: 'sendTelegramMessage',
                body: formattedBody,
              });

              state.lastConfirmedCount = state.pendingCount;
              state.timer = null;
              state.pendingCount = 0;
            }, CONFIG.timers.confirmDelay);
          }
        }
      });
    }

    /**
     * System Initialization
     */
    setTimeout(() => {
      const initialChats = getChatData();

      // Ensure startup notification only fires once per session
      if (!sessionStorage.getItem('bale_monitor_started')) {
        const unreadChats = initialChats.filter((chat) => chat.count > 0);
        let startupMsg = '🚀 Bale Monitor Started!';

        if (unreadChats.length > 0) {
          startupMsg += '\n\n📥 Current Unread Messages:';
          unreadChats.forEach((chat) => {
            startupMsg += `\n• ${chat.name}: ${chat.count}`;
          });
        } else {
          startupMsg += '\n\n✅ No unread messages right now.';
        }

        browser.runtime.sendMessage({
          action: 'sendTelegramMessage',
          body: startupMsg,
        });

        sessionStorage.setItem('bale_monitor_started', 'true');
      }

      // Establish state baseline
      initialChats.forEach(({ name, count }) => {
        chatStates.set(name, { lastConfirmedCount: count, pendingCount: 0, timer: null });
      });

      // Observe DOM mutations to trigger scans efficiently
      let debounceTimer: ReturnType<typeof setTimeout>;

      const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          scanPage();
        }, CONFIG.timers.debounceDelay);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      console.log('Bale Monitor initialized.');
    }, CONFIG.timers.startupDelay);
  },
});
