import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "santri-list.spec.js",
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },
});