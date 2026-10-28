// ============================================================
// playwright.config.js
// Basic settings for the framework.
// ============================================================

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',           // Folder with the test files
  testMatch: '**/*.spec.js',    // Only files ending with .spec.js
  timeout: 60000,               // Max 60 seconds per test (public site can be slow)
  expect: { timeout: 10000 },   // Each assertion waits up to 10 seconds
  retries: 1,                   // Retry a failed test once
  workers: 1,                   // Run tests ONE at a time (same users share a cart)
  fullyParallel: false,
  reporter: [['html', { open: 'never' }], ['list']], // HTML report + console list
  use: {
    browserName: 'chromium',        // Chrome-like browser
    headless: true,                 // false = watch the browser
    actionTimeout: 15000,           // click/fill wait max 15s (clear error for auto-heal)
    screenshot: 'only-on-failure',  // Screenshot when a test fails
    video: 'retain-on-failure',     // Video when a test fails
    trace: 'retain-on-failure',     // Trace when a test fails
  },
});
