import { storage } from '#imports';
import { browser } from 'wxt/browser';

document.addEventListener('DOMContentLoaded', async () => {
  const botTokenInput = document.getElementById('botToken') as HTMLInputElement;
  const chatIdInput = document.getElementById('chatId') as HTMLInputElement;
  const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
  const manageExtBtn = document.getElementById('manageExtBtn') as HTMLButtonElement;
  const statusEl = document.getElementById('status') as HTMLSpanElement;

  let typingTimer: ReturnType<typeof setTimeout>;
  const doneTypingInterval = 500;

  /**
   * Displays a temporary status message in the UI with a fade-out effect.
   *
   * @param message - The text payload to display.
   * @param type - The severity level determining the CSS class ('success', 'error', 'info').
   */
  const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
    statusEl.textContent = message;
    statusEl.className = `status-${type}`;
    statusEl.style.opacity = '1';

    setTimeout(() => {
      if (statusEl.textContent === message) {
        statusEl.style.opacity = '0';
        setTimeout(() => {
          if (statusEl.style.opacity === '0') statusEl.textContent = '';
        }, 300);
      }
    }, 2500);
  };

  /**
   * Opens the Chrome Extensions management page specifically focused on this extension.
   */
  manageExtBtn.addEventListener('click', () => {
    browser.tabs.create({ url: `chrome://extensions/?id=${browser.runtime.id}` });
  });

  // Initialize input fields with persisted credentials
  const savedToken = await storage.getItem('local:botToken');
  const savedChatId = await storage.getItem('local:chatId');

  if (savedToken) botTokenInput.value = savedToken as string;
  if (savedChatId) chatIdInput.value = savedChatId as string;

  /**
   * Persists the current input values to local storage.
   */
  const saveConfig = async () => {
    const tokenVal = botTokenInput.value.trim();
    const chatVal = chatIdInput.value.trim();

    await storage.setItem('local:botToken', tokenVal);
    await storage.setItem('local:chatId', chatVal);

    showStatus('💾 Auto-saved successfully', 'success');
  };

  /**
   * Debounces input events to prevent excessive storage write operations.
   */
  const handleInput = () => {
    clearTimeout(typingTimer);
    showStatus('Saving...', 'info');
    typingTimer = setTimeout(saveConfig, doneTypingInterval);
  };

  botTokenInput.addEventListener('input', handleInput);
  chatIdInput.addEventListener('input', handleInput);

  /**
   * Dispatches a test message request to the background service worker.
   */
  testBtn.addEventListener('click', async () => {
    const tokenVal = botTokenInput.value.trim();
    const chatVal = chatIdInput.value.trim();

    if (!tokenVal || !chatVal) {
      showStatus('⚠️ Please fill out both fields first.', 'error');
      return;
    }

    showStatus('⏳ Sending test notification...', 'info');

    browser.runtime
      .sendMessage({ action: 'sendTestMessage' })
      .then((response: any) => {
        if (response?.success) {
          showStatus('✅ Test message delivered!', 'success');
        } else {
          showStatus('❌ Failed: ' + (response?.error || 'Unknown error'), 'error');
        }
      })
      .catch((error) => {
        console.error('Message dispatch error:', error);
        showStatus('❌ Failed to communicate with background script', 'error');
      });
  });
});
