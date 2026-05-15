import { defineConfig, devices } from "@playwright/test";

const webServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER
  ? undefined
  : {
      command: "node node_modules/next/dist/bin/next dev -p 3500",
      url: "http://localhost:3500",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "ignore" as const,
      stderr: "ignore" as const,
    };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3500",
    trace: "on-first-retry",
  },
  webServer,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
