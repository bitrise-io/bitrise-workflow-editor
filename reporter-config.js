const { defineConfig } = require("cypress")

module.exports = defineConfig({
  reporterEnabled: "spec, mocha-junit-reporter",
  mochaJunitReporterReporterOptions: {
    mochaFile: "spec/integration/cypress/results/test-report.xml",
  },
})
