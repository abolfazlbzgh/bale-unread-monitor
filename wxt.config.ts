import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.png',
    developmentIndicator: false, // <--- ADD THIS LINE TO DISABLE GRAYSCALE
  },
  runner: {
    disabled: true,
  },
  manifest: {
    name: 'Bale Unread Monitor',
    description: 'Monitors unread messages and sends Telegram alerts.',
    version: '1.0.0',
    permissions: ['storage'],
    host_permissions: ['https://api.telegram.org/*'],
  },
});
