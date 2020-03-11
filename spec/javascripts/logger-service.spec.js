import DataDogLoggerService from "../../source/javascripts/services/logger-service";

describe("DataDogLoggerService", () => {
	var mockLogs;

	beforeEach(() => {
		mockLogs = jasmine.createSpyObj("logs", ["init"]);
	});

	it("initialized correctly", () => {
		const apiKey = "some-api-key";
		new DataDogLoggerService(mockLogs, apiKey);

		expect(mockLogs.init).toHaveBeenCalledWith({ apiKey });
	});
});
