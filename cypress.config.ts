import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
	projectId: "rnnyfb",
	videoUploadOnPasses: false,
	requestTimeout: 12000,
	videosFolder: "./spec/integration/cypress/videos",
	screenshotsFolder: "./spec/integration/cypress/screenshots",
	env: {
		PORT: 4000,
		TAGS: "@run or not @skip"
	},
  e2e: {
		fixturesFolder: "./spec/integration/fixture",
		supportFile: "./spec/integration/cypress/index.js",
    specPattern: "./spec/integration/**/*.feature",
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
					target: "es6",
          plugins: [createEsbuildPlugin(config)],
        })
      );

      return config;
    },
  },
});
