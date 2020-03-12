describe("DataDogLoggerService", () => {
  const testApiKey = "some-api-key";

  let logger;
  let mockDatadogLogs = {};

	beforeEach(() => {
    window.datadogLogs = mockDatadogLogs;

    module("BitriseWorkflowEditor");
    module(($provide) => {
			$provide.constant("DATADOG_API_KEY", testApiKey);
    });

    mockDatadogLogs.init = jasmine.createSpy("init");
    mockDatadogLogs.logger = {
      info: jasmine.createSpy("info"),
      error: jasmine.createSpy("error"),
      warn: jasmine.createSpy("warn"),
    };
  });

	beforeEach(inject((_logger_) => {
		logger = _logger_;
  }));

	it("initialized correctly", () => {
		expect(mockDatadogLogs.init).toHaveBeenCalledWith({
      clientToken: testApiKey,
      forwardErrorsToLogs: false
    });
  });

  it("should use datadog info logging", () => {
    logger.info("test", "test-ctx");
    expect(mockDatadogLogs.logger.info).toHaveBeenCalledWith("test", "test-ctx");
  });

  it("should use datadog error logging", () => {
    logger.error("test", "test-ctx");
    expect(mockDatadogLogs.logger.error).toHaveBeenCalledWith("test", "test-ctx");
  });

  it("should use datadog warning logging", () => {
    logger.warn("test", "test-ctx");
    expect(mockDatadogLogs.logger.warn).toHaveBeenCalledWith("test", "test-ctx");
  });
});
