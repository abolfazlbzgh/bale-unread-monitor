import { defineBackground, storage } from '#imports';
import { browser } from 'wxt/browser';

interface QueueItem {
  body: string;
  isTest: boolean;
  sendResponse?: (response: any) => void;
}

export default defineBackground(() => {
  const messageQueue: QueueItem[] = [];
  let isProcessing = false;

  /**
   * Sequentially processes the message queue to dispatch notifications
   * while adhering to external API rate limits.
   */
  const processQueue = async () => {
    // Prevent concurrent execution
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;
    const item = messageQueue.shift();

    if (item) {
      try {
        const botToken = await storage.getItem('local:botToken');
        const chatId = await storage.getItem('local:chatId');

        if (!botToken || !chatId) {
          console.error('Missing configuration credentials.');
          if (item.sendResponse) item.sendResponse({ success: false, error: 'Missing config' });
        } else {
          const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const textBody = item.isTest
            ? '🛠️ Test Message: Your Bale Monitor is connected successfully!'
            : item.body;

          const data = { chat_id: chatId, text: textBody };

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const responseData = await res.json();

          if (!responseData.ok) {
            console.error('Telegram API Error:', responseData.description);
            if (item.sendResponse)
              item.sendResponse({ success: false, error: responseData.description });
          } else {
            if (item.sendResponse) item.sendResponse({ success: true });
          }
        }
      } catch (error) {
        console.error('Message dispatch failed:', error);
        if (item.sendResponse) item.sendResponse({ success: false, error: String(error) });
      }

      // Enforce 1.5s delay to prevent HTTP 429 (Too Many Requests)
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    isProcessing = false;

    // Trigger next cycle if queue is populated
    if (messageQueue.length > 0) {
      processQueue();
    }
  };

  /**
   * Listens for internal extension messages and enqueues them for processing.
   */
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendTelegramMessage' || request.action === 'sendTestMessage') {
      messageQueue.push({
        body: request.body,
        isTest: request.action === 'sendTestMessage',
        sendResponse: request.action === 'sendTestMessage' ? sendResponse : undefined,
      });

      processQueue();

      // Return true to keep the message channel open for asynchronous responses
      return true;
    }
  });
});
