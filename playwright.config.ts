import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true, // Force headless mode
  },
  projects: [
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'iPhone 12',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npx vite --no-open --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
