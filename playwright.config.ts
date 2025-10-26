import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: [['list'], ['html', { outputFolder: 'coverage/e2e' }]],
  use: { 
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
  webServer: process.env.PLAYWRIGHT_WEB_SERVER_CMD
    ? { 
        command: process.env.PLAYWRIGHT_WEB_SERVER_CMD, 
        port: Number(process.env.PLAYWRIGHT_WEB_SERVER_PORT || 3000), 
        reuseExistingServer: true 
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});