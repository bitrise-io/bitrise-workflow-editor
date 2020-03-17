describe("DataDogLoggerService", () => {
	const testApiKey = "some-api-key";
	const testServiceName = "testService";
	const mockContext = { test: "test-val", test2: "test2-val" };

	let logger;
	let mockInnerLogger;
	let mockDatadogLogs = {
		// TODO: leave it here because we are using Ddog singleton logger -> removal results in test failure
		init: _.identity,
		createLogger: _.identity
	};

	window.datadogLogs = mockDatadogLogs;

	beforeEach(() => {
		module("BitriseWorkflowEditor");
		module($provide => {
			$provide.constant("DATADOG_API_KEY", testApiKey);
			$provide.constant("IS_ANALYTICS", true);
			$provide.constant("SERVICE_NAME", testServiceName);
		});

		mockInnerLogger = {
			info: jasmine.createSpy("info"),
			debug: jasmine.createSpy("debug"),
			error: jasmine.createSpy("error"),
			warn: jasmine.createSpy("warn"),
			addContext: jasmine.createSpy("contextSetter")
		};

		spyOn(mockDatadogLogs, "init");
		spyOn(mockDatadogLogs, "createLogger").and.callFake(() => mockInnerLogger);
	});

	beforeEach(inject(_logger_ => {
		logger = _logger_;
	}));

	it("initialized correctly", () => {
		expect(mockDatadogLogs.init).toHaveBeenCalledWith({ clientToken: testApiKey, forwardErrorsToLogs: false });
		expect(mockDatadogLogs.createLogger).toHaveBeenCalledWith(
			testServiceName,
			jasmine.objectContaining({
				handler: "http",
				level: "warn"
			})
		);
	});

	it("setTags", () => {
		logger.setTags(mockContext);

		expect(mockInnerLogger.addContext).toHaveBeenCalledWith("test", "test-val");
		expect(mockInnerLogger.addContext).toHaveBeenCalledWith("test2", "test2-val");
	});

	it("should use datadog debug logging", () => {
		logger.debug("test", mockContext);
		expect(mockInnerLogger.debug).toHaveBeenCalledWith("test", mockContext);
	});

	it("should use datadog info logging", () => {
		logger.info("test", mockContext);
		expect(mockInnerLogger.info).toHaveBeenCalledWith("test", mockContext);
	});

	it("should use datadog error logging", () => {
		logger.error("test", mockContext);
		expect(mockInnerLogger.error).toHaveBeenCalledWith("test", mockContext);
	});

	it("should use datadog warning logging", () => {
		logger.warn("test", mockContext);
		expect(mockInnerLogger.warn).toHaveBeenCalledWith("test", mockContext);
	});
});
