import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    video: true,
    defaultBrowser: "chrome",
  },
  setupNodeEvents(on) {
    on(
      "before:browser:launch",
      (
        browser = {
          name: "",
          family: "chromium",
          channel: "",
          displayName: "",
          version: "",
          majorVersion: "",
          path: "",
          isHeaded: false,
          isHeadless: false,
        },
        launchOptions
      ) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--use-fake-ui-for-media-stream");
          launchOptions.args.push("--use-fake-device-for-media-stream");
          launchOptions.args.push("--disable-geolocation");
        }
        return launchOptions;
      }
    );
  },
  projectId: "9994rq",
});
