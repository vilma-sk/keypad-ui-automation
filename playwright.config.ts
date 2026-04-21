import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'smoke-chromium',
      use: { browserName: 'chromium' },
      grep: /@Smoke/
    },
    {
      name: 'smoke-firefox',
      use: { browserName: 'firefox' },
      grep: /@Smoke/
    },
    {
      name: 'smoke-webkit',
      use: { browserName: 'webkit' },
      grep: /@Smoke/
    },
    {
      name: 'regression-chromium',
      use: { browserName: 'chromium' },
      grep: /@Regression/
    }
  ]
});