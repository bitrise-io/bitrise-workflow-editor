describe("RequestService", () => {
	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(_RequestService_ => {
		jasmine.Ajax.install();
		RequestService = _RequestService_;
	}));
	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	function itActsLikeAnAbortableRequest() {
		describe("when request is aborted through request config", () => {
			it("gets aborted", done => {
				const aborter = new Promise(resolve => {
					setTimeout(() => {
						resolve();
					}, 0);
				});
				jasmine.Ajax.stubRequest(/.*/).andCallFunction(() => {});

				RequestService.getAppConfigYML(aborter)
					.then(done.fail)
					.catch(error => {
						expect(error).toEqual(new Error("Error loading app config: request aborted."));
						done();
					});
			});
		});
	}

	describe("getAppConfigYML", () => {
		describe("when in website mode", () => {
			beforeEach(() => {
				RequestService.configure({ mode: "website", appSlug: "my-app-slug" });
			});

			itActsLikeAnAbortableRequest();

			describe("and response is successful", () => {
				it("resolves with app config", done => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						responseText: "my-app-config"
					});

					RequestService.getAppConfigYML()
						.then(appConfig => {
							expect(appConfig).toBe("my-app-config");
							done();
						})
						.catch(done.fail);
				});
			});

			describe("and response is not successful, but bitrise.yml is still returned", () => {
				it("rejects with received error & with bitrise.yml", done => {
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						status: 422,
						responseJSON: {
							bitrise_yml: "my-invalid-app-config",
							error_msg: "Some error"
						}
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch(responseData => {
							expect(responseData.bitrise_yml).toBe("my-invalid-app-config");
							expect(responseData.error_message).toEqual(new Error("Error loading app config: Some error"));
							done();
						});
				});
			});

			describe("and response is not successful, and bitrise.yml is not returned", () => {
				it("rejects with received error only", done => {
					RequestService.configure({ mode: "website", appSlug: "my-app-slug" });
					jasmine.Ajax.stubRequest("/api/app/my-app-slug/config.yml").andReturn({
						status: 400,
						responseJSON: {
							error_msg: "Some error"
						}
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch(error => {
							expect(error).toEqual(new Error("Some error"));
							done();
						});
				});
			});
		});

		describe("when in CLI mode", () => {
			beforeEach(() => {
				RequestService.configure({ mode: "cli" });
			});

			itActsLikeAnAbortableRequest();

			describe("and response is successful", () => {
				it("resolves with app config", done => {
					RequestService.configure({ mode: "cli" });
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({ responseText: "my-app-config" });

					RequestService.getAppConfigYML()
						.then(appConfig => {
							expect(appConfig).toBe("my-app-config");
							done();
						})
						.catch(done.fail);
				});
			});

			describe("and response is not successful, but bitrise.yml is still returned", () => {
				it("rejects with received error & with bitrise.yml", done => {
					RequestService.configure({ mode: "cli" });
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						status: 422,
						responseJSON: {
							bitrise_yml: "my-invalid-app-config",
							error: "Some error"
						}
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch(responseData => {
							expect(responseData.bitrise_yml).toBe("my-invalid-app-config");
							expect(responseData.error_message).toEqual(new Error("Error loading app config: Some error"));
							done();
						});
				});
			});

			describe("and response is not successful, and bitrise.yml is not returned", () => {
				it("rejects with received error only", done => {
					RequestService.configure({ mode: "cli" });
					jasmine.Ajax.stubRequest("/api/bitrise-yml").andReturn({
						status: 400,
						responseJSON: {
							error: "Some error"
						}
					});

					RequestService.getAppConfigYML()
						.then(done.fail)
						.catch(error => {
							expect(error).toEqual(new Error("Some error"));
							done();
						});
				});
			});
		});
	});
});
