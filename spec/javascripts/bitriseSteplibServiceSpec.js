describe("bitriseSteplibService", function() {

	var bitriseSteplibService;
	var Step;
	var Variable;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_bitriseSteplibService_, _Step_, _Variable_) {
		bitriseSteplibService = _bitriseSteplibService_;
		Step = _Step_;
		Variable = _Variable_;
	}));

	beforeEach(function() {
		bitriseSteplibService.specs = {
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
		}

		bitriseSteplibService.latestStepVersions = _.mapObject(bitriseSteplibService.specs.steps, function(versionsOfStep, aStepID) {
			return bitriseSteplibService.specs.steps[aStepID].latest_version_number;
		});
	});

	describe("stepFromCVS", function() {

		it("should create step as Bitrise steplib step", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step@1.0"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("::red-step@1.0"))).toBe(true);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("https://bitrise-steplib-collection.s3.amazonaws.com/spec.json::red-step@1.0"))).toBe(true);
		});

		it("should create step as not Bitrise steplib step", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("custom-source::custom-step@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("git::custom-step.git@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("_::custom-step@1.0"))).toBe(false);
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("custom-source::red-step@1.0"))).toBe(false);
		});

		it("should configure step with default values if it is a Bitrise steplib step", function() {
			expect(bitriseSteplibService.stepFromCVS("red-step@1.0").title()).toBe("Red step 1.0");
			expect(bitriseSteplibService.stepFromCVS("green-step").title()).toBe("Green step 1.1");
		});

		it("should throw error if cvs has multiple '::'", function() {
			expect(function() {
				bitriseSteplibService.stepFromCVS("source::source::red-step@1.0").toThrow();
			});
		});

		it("should throw error if cvs has multiple '@'", function() {
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

		it("should return true if cvs specifies Bitrise steplib source URL", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("https://bitrise-steplib-collection.s3.amazonaws.com/spec.json::red-step"))).toBe(true);
		});

		it("should return true if cvs has no source specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("red-step"))).toBe(true);
		});

		it("should return true if cvs has empty source specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("::red-step"))).toBe(true);
		});

		it("should return false if cvs has 'git' specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("git::red-step.git"))).toBe(false);
		});

		it("should return false if cvs has '_' specified", function() {
			expect(bitriseSteplibService.isBitriseSteplibStep(bitriseSteplibService.stepFromCVS("_::red-step"))).toBe(false);
		});

		it("should return false if cvs has source URL specified", function() {
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

		it("should keep parameters which are not defined in the new version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.summary()).toBe("Red summary");
		});

		it("should keep inputs which are not defined in the new version, add inputs which are not defined in the old version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.inputs().length).toBe(4);
		});

		it("should keep input options which are not defined in the same input of the new version", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.inputs()[0].description()).not.toBeUndefined();
		});

		it("should overwrite input value and options with new version's", function() {
			step = bitriseSteplibService.stepFromCVS("red-step@1.0");
			bitriseSteplibService.changeStepToVersion(step, "1.1");

			expect(step.inputs()[0].value()).toBe("new-red-input-value");
			expect(step.inputs()[0].summary()).toBe("Red input summary 1.1");
		});

	});

});
