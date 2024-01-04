describe("DataDogLoggerService", () => {
	const testApiKey = "some-api-key";
	const testServiceName = "testService";
	const mockContext = { test: "test-val", test2: "test2-val" };

	let logger;
	let mockInnerLogger;
	const mockDatadogLogs = {
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
			setContext: jasmine.createSpy("contextSetter")
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
				level: "info"
			})
		);
	});

	it("setTags", () => {
		logger.setTags(mockContext);

		expect(mockInnerLogger.setContext).toHaveBeenCalledWith(mockContext);
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
		const mockError = new Error("test");
		const expectedMessage = `test\n${mockError.stack}`;

		logger.error(mockError, mockContext);

		expect(mockInnerLogger.error).toHaveBeenCalledWith(expectedMessage, mockContext);
	});

	it("should handle null errors", () => {
		logger.error();
		expect(mockInnerLogger.error).not.toHaveBeenCalled();
	});

	it("should use datadog warning logging", () => {
		logger.warn("test", mockContext);
		expect(mockInnerLogger.warn).toHaveBeenCalledWith("test", mockContext);
	});
});
