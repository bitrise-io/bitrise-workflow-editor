import { defineConfig } from "cypress"

export default defineConfig({
  projectId: "rnnyfb",
  fixturesFolder: "spec/integration/fixture",
  screenshotsFolder: "spec/integration/cypress/screenshots",
  videosFolder: "spec/integration/cypress/videos",
  videoUploadOnPasses: false,
  requestTimeout: 12000,
  env: {
    PORT: 4000,
    TAGS: "@run or not @skip",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./spec/integration/cypress/plugins")(on, config)
    },
    specPattern: "spec/integration/**/*.feature",
    supportFile: "spec/integration/cypress/index.js",
  },
})
