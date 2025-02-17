// Karma configuration
// Generated on Wed Jan 15 2020 13:26:53 GMT+0100 (Central European Standard Time)

// verbose logging
process.on("infrastructure_error", (error) => {
	console.error("infrastructure_error", error);
});

module.exports = (config) => {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "../build",

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["jasmine"],

		// list of files / patterns to load in the browser
		files: [
			"javascripts/vendor.js",
			"javascripts/routes.js",
			"../node_modules/jasmine-ajax/lib/mock-ajax.js",
			"../node_modules/angular-mocks/angular-mocks.js",
			"../spec/mocks.js",
			"javascripts/main.js",
			"../spec/javascripts/**/*.spec.js",
		],

		// list of files / patterns to exclude
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["spec"],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ["jsdom"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: 4,

		coverageReporter: {
			type: "text-summary",
		},
		specReporter: {
			// do not print information about skipped tests
			suppressSkipped: true,
		},
	});
};
