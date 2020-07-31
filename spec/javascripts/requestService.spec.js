describe("RequestService", () => {
	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(_RequestService_ => {
		jasmine.Ajax.install();
		RequestService = _RequestService_;
	}));
	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	describe("getAppConfigYML", () => {
		describe("when in website mode", () => {
			it("calls website endpoint", done => {
				RequestService.configure({ mode: "website", appSlug: "my-app-slug" });
				jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({ responseText: "my-app-config" });

				RequestService.getAppConfigYML()
					.then(appConfig => {
						expect(appConfig).toBe("my-app-config");
						done();
					})
					.catch(done.fail);
			});
		});

		describe("when in CLI mode", () => {
			it("calls CLI endpoint", done => {
				RequestService.configure({ mode: "cli", appSlug: "my-app-slug" });
				jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({ responseText: "my-app-config" });

				RequestService.getAppConfigYML()
					.then(appConfig => {
						expect(appConfig).toBe("my-app-config");
						done();
					})
					.catch(done.fail);
			});
		});
	});
});
