import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/frontend',
  timeout: 30 * 1000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
  },
  globalSetup: './playwright/setup.ts',
  globalTeardown: './playwright/teardown.ts',
});
