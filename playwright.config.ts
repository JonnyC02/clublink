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
  projects: [
    {
      name: 'UI Tests',
      testDir: './tests/frontend',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'API Tests',
      testDir: './tests/backend',
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
  ],
});
