describe("RequestService", () => {
	let RequestService;
	let logger;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject((_RequestService_, _logger_) => {
		jasmine.Ajax.install();
		logger = _logger_;
		spyOn(logger, "debug");
		spyOn(logger, "info");
		spyOn(logger, "warn");
		spyOn(logger, "error");
		RequestService = _RequestService_;
	}));
	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	function itActsLikeAnAbortableRequest() {
		describe("when request is aborted through request config", () => {
			it("gets aborted", (done) => {
				const aborter = new Promise((resolve) => {
					setTimeout(() => {
						resolve();
					}, 0);
				});
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				jasmine.Ajax.stubRequest(/.*/).andCallFunction(() => { });

				RequestService.getAppConfigYML(aborter)
					.then(done.fail)
					.catch((error) => {
						expect(error.message).toMatch(/GET .+ - Aborted/);
						done();
					});
			});
		});
	}

	describe("getAppConfigYML", () => {
		describe("when in website mode", () => {
			beforeEach(() => {
				RequestService.configure({ mode: "website", appSlug: "my-app-slug", logger: logger });
			});

			itActsLikeAnAbortableRequest();

			describe("and response is successful", () => {
				it("resolves with app config", (done) => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						responseText: "my-app-config",
					});

					RequestService.getAppConfigYML()
						.then((appConfig) => {
							expect(appConfig).toEqual({ version: null, content: "my-app-config" });
							done();
						})
						.catch(done.fail);
				});
			});

			describe("and response is successful with version header", () => {
				it("resolves with app config and version", (done) => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						responseText: "my-app-config",
						responseHeaders: { "Bitrise-Config-Version": "7a6s5dfvas6df" },
					});

					RequestService.getAppConfigYML()
						.then((appConfig) => {
							expect(appConfig).toEqual({ version: "7a6s5dfvas6df", content: "my-app-config" });
							done();
						})
						.catch(done.fail);
				});
			});

			describe("and response is not successful, but bitrise.yml is still returned", () => {
				it("rejects with received error & with bitrise.yml, logs warning", (done) => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						status: 422,
						responseJSON: {
							bitrise_yml: "my-invalid-app-config",
							error_msg: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((responseData) => {
							expect(responseData.bitriseYml).toBe("my-invalid-app-config");
							expect(responseData.error).toEqual(new Error("Error loading app config: Some error"));
							expect(logger.warn).toHaveBeenCalledWith("Error loading app config: Some error");
							expect(logger.error).not.toHaveBeenCalled();
							done();
						});
				});
			});

			describe("and response is not successful, and bitrise.yml is not returned", () => {
				it("rejects with received error only, logs warning", (done) => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						status: 400,
						responseJSON: {
							error_msg: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((error) => {
							expect(error).toEqual(new Error("Some error"));
							expect(logger.warn).toHaveBeenCalledWith("Some error");
							expect(logger.error).not.toHaveBeenCalled();
							done();
						});
				});
			});

			describe("and response is internal server error", () => {
				it("rejects with received error only, logs error", (done) => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						status: 500,
						responseJSON: {
							error_msg: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((error) => {
							expect(error).toEqual(new Error("Some error"));
							expect(logger.warn).not.toHaveBeenCalled();
							expect(logger.error).toHaveBeenCalledWith(new Error("Some error"));
							done();
						});
				});
			});
		});

		describe("when in CLI mode", () => {
			beforeEach(() => {
				RequestService.configure({ mode: "cli", logger: logger });
			});

			itActsLikeAnAbortableRequest();

			describe("and response is successful", () => {
				it("resolves with app config", (done) => {
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({ responseText: "my-app-config" });

					RequestService.getAppConfigYML()
						.then((appConfig) => {
							expect(appConfig).toEqual({ version: null, content: "my-app-config" });
							done();
						})
						.catch(done.fail);
				});
			});

			// NOTE: It is just a theoritical case, as the CLI mode does not have versioning
			describe("and response is successful with version header", () => {
				it("resolves with app config and version", (done) => {
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						responseText: "my-app-config",
						responseHeaders: { "Bitrise-Config-Version": "7a6s5dfvas6df" },
					});

					RequestService.getAppConfigYML()
						.then((appConfig) => {
							expect(appConfig).toEqual({ version: "7a6s5dfvas6df", content: "my-app-config" });
							done();
						})
						.catch(done.fail);
				});
			});

			describe("and response is not successful, but bitrise.yml is still returned", () => {
				it("rejects with received error & with bitrise.yml, logs warning", (done) => {
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						status: 422,
						responseJSON: {
							bitrise_yml: "my-invalid-app-config",
							error: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((responseData) => {
							expect(responseData.bitriseYml).toBe("my-invalid-app-config");
							expect(responseData.error).toEqual(new Error("Error loading app config: Some error"));
							expect(logger.warn).toHaveBeenCalledWith("Error loading app config: Some error");
							expect(logger.error).not.toHaveBeenCalled();
							done();
						});
				});
			});

			describe("and response is not successful, and bitrise.yml is not returned", () => {
				it("rejects with received error only, logs warning", (done) => {
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						status: 400,
						responseJSON: {
							error: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((error) => {
							expect(error).toEqual(new Error("Some error"));
							expect(logger.warn).toHaveBeenCalledWith("Some error");
							expect(logger.error).not.toHaveBeenCalled();
							done();
						});
				});
			});

			describe("and response is internal server error", () => {
				it("rejects with received error only, logs error", (done) => {
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						status: 500,
						responseJSON: {
							error: "Some error",
						},
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch((error) => {
							expect(error).toEqual(new Error("Some error"));
							expect(logger.warn).not.toHaveBeenCalled();
							expect(logger.error).toHaveBeenCalledWith(new Error("Some error"));
							done();
						});
				});
			});
		});
	});
});
