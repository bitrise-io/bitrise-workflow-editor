describe("DataDogLoggerService", () => {
  const testApiKey = "some-api-key";

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
    module(($provide) => {
      $provide.constant("DATADOG_API_KEY", testApiKey);
      $provide.constant("IS_PROD", true);
    });

    mockInnerLogger = {
      info: jasmine.createSpy("info"),
      error: jasmine.createSpy("error"),
      warn: jasmine.createSpy("warn"),
      setContext: jasmine.createSpy("contextSetter"),
    };

    spyOn(mockDatadogLogs, "init");
    spyOn(mockDatadogLogs, "createLogger").and.callFake(() => mockInnerLogger);
  });

	beforeEach(inject((_logger_) => {
		logger = _logger_;
  }));

	it("initialized correctly", () => {
		expect(mockDatadogLogs.init).toHaveBeenCalledWith({ clientToken: testApiKey });
    expect(mockDatadogLogs.createLogger).toHaveBeenCalled();
  });

  it("setContext", () => {
    const mockContext = { test: 'test' };

    logger.setContext(mockContext);
    expect(mockInnerLogger.setContext).toHaveBeenCalledWith(mockContext);
  });

  it("should use datadog info logging", () => {
    logger.info("test", "test-ctx");
    expect(mockInnerLogger.info).toHaveBeenCalledWith("test", "test-ctx");
  });

  it("should use datadog error logging", () => {
    logger.error("test", "test-ctx");
    expect(mockInnerLogger.error).toHaveBeenCalledWith("test", "test-ctx");
  });

  it("should use datadog warning logging", () => {
    logger.warn("test", "test-ctx");
    expect(mockInnerLogger.warn).toHaveBeenCalledWith("test", "test-ctx");
  });
});
