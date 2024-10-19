import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Directory where your test files are located
  timeout: 30 * 1000, // Timeout for each test (30 seconds)
  retries: 1, // Retries failed tests once
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:3000', // Base URL for your app (assuming it's running locally)
    browserName: 'chromium', // Default browser
  },
});
