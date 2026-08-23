import { defineConfig, devices } from '@playwright/test';

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '5174';
if (!/^\d{2,5}$/.test(playwrightPort)) {
  throw new Error(`Invalid PLAYWRIGHT_PORT: ${playwrightPort}`);
}
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-3456x2234',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 3456, height: 2234 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'retina-1728x1117-dsf2',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1728, height: 1117 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'ipad-landscape',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
    {
      name: 'ipad-portrait',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: `npm run dev -- --host 127.0.0.1 --port ${playwrightPort} --strictPort`,
        url: baseURL,
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
      },
});
