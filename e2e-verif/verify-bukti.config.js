import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "bukti-foto.spec.js",
  timeout: 90000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5174",
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  },
  webServer: {
    command: "VITE_PUBLIC_API=http://localhost:5001 npm run dev -- --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    timeout: 120000,
  },
});