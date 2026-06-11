import { defineConfig, devices } from '@playwright/test'

// E2E smoke tests for OrderHub. Run with:
//   npx playwright install chromium   # once, to fetch the browser
//   npm run test:e2e
const PORT = 4173
const HOST = '127.0.0.1'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Build then serve a static preview so the test doesn't depend on the
  // Power Apps dev plugin or a power.config.json file.
  webServer: {
    command: `npm run build && npx vite preview --host ${HOST} --port ${PORT}`,
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
