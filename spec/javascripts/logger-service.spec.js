fdescribe("DataDogLoggerService", () => {
	let logger;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(() => {
		global.logger = jasmine.createSpyObj("logs", ["init"]);
	});
	beforeEach(inject(function(_logger_) {
		logger = _logger_;
	}));

	it("initialized correctly", () => {
		const apiKey = "some-api-key";

		expect(global.logger.init).toHaveBeenCalledWith({ apiKey });
	});
});
