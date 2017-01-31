describe("bitriseSteplibService", function() {

	var $httpBackend;
	var bitriseSteplibService;
	var Step;
	var Variable;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_$httpBackend_, _requestService_, _bitriseSteplibService_, _Step_, _Variable_) {
		$httpBackend = _$httpBackend_;
		requestService = _requestService_;
		requestService.mode = "website";
		bitriseSteplibService = _bitriseSteplibService_;
		Step = _Step_;
		Variable = _Variable_;
	}));

	beforeEach(function(done) {
		$httpBackend.when("GET", bitriseSteplibService.sourceURL).respond({
			steps: {
				"red-step": {
					versions: {
						"1.1": {
							title: "Red step 1.1",
							inputs: [{
								red_input: "new-red-input-value",
								opts: {
									title: "Red input title",
									summary: "Red input summary 1.1"
								}
							}, {
								yellow_input: "yellow-input-value",
								opts: {
									title: "Yellow input title"
								}
							}]
						},
						"1.0": {
							title: "Red step 1.0",
							summary: "Red summary",
							description: "Red description",
							is_always_run: true,
							inputs: [{
								red_input: "red-input-value",
								opts: {
									title: "Red input title",
									summary: "Red input summary 1.0",
									description: "Red input description"
								}
							}, {
								green_input: "green-input-value",
								opts: {
									title: "Green input title"
								}
							}, {
								blue_input: "blue-input-value",
								opts: {
									title: "Blue input title"
								}
							}]
						}
					},
					latest_version_number: "1.1"
				},
				"green-step": {
					versions: {
						"1.1": {
							title: "Green step 1.1"
						},
						"1.0": {
							title: "Green step 1.0"
						}
					},
					latest_version_number: "1.1"
				}
			}
		});

		$httpBackend.expectGET(bitriseSteplibService.sourceURL);

		bitriseSteplibService.load().then(done, function(errorMessage) {
			done.fail("Bitrise Steplib failed to load");
		});

		$httpBackend.flush();
	}, 8000);

	describe("load", function() {

		it("should have specs set", function() {
			expect(bitriseSteplibService.specs).not.toBeUndefined();
		});

		it("should have steps set", function() {
			expect(bitriseSteplibService.steps).not.toBeUndefined();
		});

		it("should have latest step versions set", function() {
			expect(bitriseSteplibService.latestStepVersions).not.toBeUndefined();
		});

	});

	describe("stepFromCVS", function() {

		it("should create step as Bitrise steplib step if defined so in the step CVS", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step@1.0"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("::red-step@1.0"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("https://bitrise-steplib-collection.s3.amazonaws.com/spec.json::red-step@1.0"))).toBe(true);
		});

		it("should create step as not Bitrise steplib step if defined so in the step CVS", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("custom-source::custom-step@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("git::custom-step.git@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("_::custom-step@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("custom-source::red-step@1.0"))).toBe(false);
		});

		it("should configure step with default values if it is a Bitrise steplib step", function() {
			expect(bitriseSteplibService.stepFromCVS("red-step@1.0").title()).toBe("Red step 1.0");
			expect(bitriseSteplibService.stepFromCVS("green-step").title()).toBe("Green step 1.1");
		});

		it("should throw error if CVS has multiple '::'", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("source::source::red-step@1.0").toThrow();
			});
		});

		it("should throw error if CVS has multiple '@'", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("source::red-step@1.0@1.1").toThrow();
			});
		});

		it("should throw error if no ID specified", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("source::@1.0").toThrow();
			});

			expect(function() {
				bitriseSteplibService.stepFromCVS("source::").toThrow();
			});
		});

		it("should throw error if is Bitrise steplib step, but ID not found in Bitrise steplib", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("::blue-step@1.0").toThrow();
			});

			expect(function() {
				bitriseSteplibService.stepFromCVS("blue-step@1.0").toThrow();
			});
		});

		it("should throw error if has '@', but no version specified", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("source::red-step@").toThrow();
			});
		});

		it("should throw error if is Bitrise steplib step, but version not found in Bitrise steplib", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("red-step@1.2").toThrow();
			});
		});

	});

	describe("isBitriseSteplibStep", function() {

		it("should return true if CVS specifies Bitrise steplib source URL", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("https://bitrise-steplib-collection.s3.amazonaws.com/spec.json::red-step"))).toBe(true);
		});

		it("should return true if CVS has no source specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step"))).toBe(true);
		});

		it("should return true if CVS has empty source specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("::red-step"))).toBe(true);
		});

		it("should return false if CVS has 'git' specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("git::red-step.git"))).toBe(false);
		});

		it("should return false if CVS has '_' specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("_::red-step"))).toBe(false);
		});

		it("should return false if CVS has source URL specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("source-url.git::red-step"))).toBe(false);
		});

	});

	describe("changeStepToVersion", function() {

		it("should change to specified version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.version).toBe("1.1");
			expect(step.cvs).toBe("red-step@1.1");
		});

		it("should change to latest version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, null);

			expect(step.version).toBe("1.1");
			expect(step.cvs).toBe("red-step");
		});

		it("should change parameters to those of the new version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.title()).toBe("Red step 1.1");
		});

		it("should keep not default parameters which are not defined in the new version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			step.userStepConfig = {
				summary: "New red summary"
			};

			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.summary()).toBe("New red summary");
		});

		it("should keep not default inputs which are not defined in the new version, add inputs which are not defined in the old version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			step.userStepConfig = {
				inputs: [{
					yellow_input: "new-yellow-input-value"
				}]
			};

			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.userStepConfig.inputs.length).toBe(1);
		});

		it("should keep not default input options which are not defined in the same input of the new version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			step.userStepConfig = {
				inputs: [{
					red_input: "red-input-value",
					opts: {
						description: "New red input description"
					}
				}]
			};

			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.userStepConfig).not.toBeUndefined();
			expect(step.userStepConfig.inputs).not.toBeUndefined();
			expect(step.userStepConfig.inputs[0].opts).not.toBeUndefined();
			expect(step.userStepConfig.inputs[0].opts.description).toBe("New red input description");
		});

		it("should overwrite input value and options with new version's", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.defaultStepConfig.inputs[0].red_input).toBe("new-red-input-value");
			expect(step.defaultStepConfig.inputs[0].opts.summary).toBe("Red input summary 1.1");
		});

	});

	describe("versionsOfStep", function() {

		it("should return array of versions", function() {
			var step = bitriseSteplibService.stepFromCVS("red-step");

			expect(bitriseSteplibService.versionsOfStep(step)).not.toBeUndefined();
			expect(bitriseSteplibService.versionsOfStep(step)[0]).toBe("1.1");
			expect(bitriseSteplibService.versionsOfStep(step)[1]).toBe("1.0");
		});

	});

	describe("isStepLatestVersion", function() {

		it("should return true if requested version is latest", function() {
			expect(bitriseSteplibService.isStepLatestVersion(bitriseSteplibService.stepFromCVS("red-step@1.1"))).toBe(true);
		});

		it("should return true if no version is requested", function() {
			expect(bitriseSteplibService.isStepLatestVersion(bitriseSteplibService.stepFromCVS("red-step"))).toBe(true);
		});

		it("should return false if requested version is not latest", function() {
			expect(bitriseSteplibService.isStepLatestVersion(bitriseSteplibService.stepFromCVS("red-step@1.0"))).toBe(false);
		});

	});

});
