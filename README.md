# **🚀 Bale Unread Monitor**

Never miss an important message on Bale again. **Bale Unread Monitor** is a lightweight, privacy-first Chrome extension that silently monitors your open Bale web client (web.bale.ai) and instantly forwards new message alerts directly to your personal Telegram account.

**[Install Bale Unread Monitor from the Chrome Web Store](https://chromewebstore.google.com/detail/bale-unread-monitor/ophlefinlkcegcfbbclcoeeeeagkkble)**

## **✨ Key Features**

- **🔒 100% Private & Secure (Zero Tracking):** No middlemen, no databases, and no analytics. The extension runs entirely in your local browser and communicates _directly_ with the official Telegram API.
- **⚡ Zero-Lag Performance:** Instead of heavy CPU polling, it uses highly optimized native browser APIs to sleep completely until the exact millisecond a new message badge appears.
- **🛡️ Smart Anti-Spam:** Intelligently delays notifications, filters out "typing..." indicators, and prevents duplicate alerts so you only get pinged for actual finalized messages.
- **💾 Local Storage Only:** Your Telegram credentials never leave your hard drive.

## **🛠️ Setup Guide**

To receive instant notifications, you need to connect the extension to your own private Telegram bot. It takes less than 2 minutes\!

### **Step 1: Create Your Telegram Bot**

First, we need to create the bot that will send you the messages.

1. Open Telegram and search for **@BotFather** (the official Telegram bot creator).
2. Send the message `/newbot` and follow the prompts to give it a name and username.
3. BotFather will give you an **HTTP API Token** (e.g., `1234567890:ABCdefGhIJKlmNoPQRsTuvwxyZ`). Copy it.

### **Step 2: Get Your Chat ID**

Now we need to tell the bot exactly _who_ to send the messages to. **⚠️ Crucial Step:** You MUST search for your new bot in Telegram and click **"Start"** before it can send you messages\!

1. In Telegram, search for **@myidbot**.
2. Send the message `/getid`.
3. The bot will reply with your personal **Chat ID** (a string of numbers like `123456789`). Copy it.

### **Step 3: Configure the Extension**

You are done with Telegram\! Now just connect the pieces.

### Step 3: Configure the Extension

You are done with Telegram! Now just connect the pieces.

1. Click the Bale Monitor icon in your Chrome toolbar.
2. Paste your **Bot Token** into the first box.
3. Paste your **Chat ID** into the second box.
4. Click **Send Test Notification** to verify!
5. **🔄 Final Step: Refresh Bale!** Go to your open `web.bale.ai` tab and hit refresh (F5). The extension will now initialize and silently monitor your chats in the background.

## **💻 Development & Building from Source**

This extension is built using the WXT Framework to ensure modern Manifest V3 compliance and a strict TypeScript environment.

### **Prerequisites**

- Node.js (v18+)
- npm, yarn, or pnpm

### **Getting Started**

**1\. Clone the repository:** `git clone https://github.com/abolfazlbzgh/bale-unread-monitor.git`

**2\. Install dependencies:** `npm install`

**3\. Run the development server:** `npm run dev`

**4\. Build for Production:** `npm run build`

**5\. Package for the Chrome Web Store:** `npm run zip`

## **💬 Support & Community**

If you need help setting up your bot, encounter a bug, or want to suggest a new feature, join our official Telegram support channel: 👉 **Join the Bale Monitor Telegram Channel:** [https://t.me/bale_unread_monitor](https://t.me/bale_unread_monitor)

## **📜 License & Disclaimer**

**Disclaimer:** This is an independent, open-source productivity tool. It is NOT officially affiliated with, endorsed by, or sponsored by Bale Messenger or Telegram.
