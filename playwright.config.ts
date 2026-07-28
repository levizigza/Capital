import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: "http://127.0.0.1:5000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // CI: serve production build (more reliable than Vite HMR on Actions).
    // Local: `npm run dev` unless PW_PREVIEW=1 after a manual build.
    command: process.env.CI || process.env.PW_PREVIEW
      ? "npx vite preview --host 127.0.0.1 --port 5000 --strictPort"
      : "npm run dev",
    url: "http://127.0.0.1:5000",
    reuseExistingServer: !process.env.CI && !process.env.PW_FRESH_SERVER,
    timeout: process.env.CI ? 180_000 : 120_000,
    env: {
      VITE_ISLANDS: "1",
      VITE_QA: "1",
    },
  },
});
