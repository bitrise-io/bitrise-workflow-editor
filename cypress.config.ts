import { defineConfig } from "cypress"
import fs from "fs"

export default defineConfig({
  projectId: "rnnyfb",
  fixturesFolder: "spec/integration/fixture",
  screenshotsFolder: "spec/integration/cypress/screenshots",
	video: true,
  videosFolder: "spec/integration/cypress/videos",
  requestTimeout: 12000,
  viewportWidth: 1440,
  viewportHeight: 900,
  env: {
    PORT: 4000,
    TAGS: "@run or not @skip",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
			on(
				"after:spec",
				(_spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
					if (results && results.video) {
						// Do we have failures for any retry attempts?
						const failures = results.tests.some((test) =>
							test.attempts.some((attempt) => attempt.state === "failed")
						)
						if (!failures) {
							// delete the video if the spec passed and no tests retried
							fs.unlinkSync(results.video)
						}
					}
				}
			)

      return require("./spec/integration/cypress/plugins")(on, config)
    },
    specPattern: "spec/integration/**/*.feature",
    supportFile: "spec/integration/cypress/index.js",
  },
})
