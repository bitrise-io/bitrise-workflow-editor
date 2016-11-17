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

	describe("stepFromCVS", function() {

		beforeEach(function() {
			bitriseSteplibService.specs = {
				steps: {
					"red-step": {
						versions: {
							"1.1": {
								title: "Red step 1.1"
							},
							"1.0": {
								title: "Red step 1.0"
							}
						},
						latest_version_number: 1.1
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
						latest_version_number: 1.1
					}
				}
			}

			bitriseSteplibService.latestStepVersions = _.mapObject(bitriseSteplibService.specs.steps, function(versionsOfStep, aStepID) {
				return bitriseSteplibService.specs.steps[aStepID].latest_version_number;
			});
		});

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
			expect(bitriseSteplibService.stepFromCVS("red-step@1.0").title).toBe("Red step 1.0");
			expect(bitriseSteplibService.stepFromCVS("green-step").title).toBe("Green step 1.1");
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

	describe("strippedStepConfigOfStep", function() {

		var step;

		beforeEach(function() {
			bitriseSteplibService.specs = {
				steps: {
					"red-step": {
						versions: {
							"1.0": {
								title: "Red step",
								summary: "Red summary",
								description: "Red description",
								is_always_run: true,
								inputs: [{
									red_input: "red-input-value",
									opts: {
										title: "Red input title"
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
						}
					}
				}
			}

			step = new Step("red-step");
			step.version = "1.0";
		});

		it("should strip parameters which match the default", function() {
			step.appendStepConfig({
				title: "Red step"
			});

			expect(bitriseSteplibService.strippedStepConfigOfStep(step).title).toBeUndefined();
		});

		it("should keep parameters which differ from the default", function() {
			step.appendStepConfig({
				title: "Green step"
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.title).not.toBeUndefined();
			expect(strippedStepConfig.title).toBe("Green step");
		});

		it("should keep parameters not found in the default parameters", function() {
			step.appendStepConfig({
				unknown_parameter: "Unknown parameter"
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.unknown_parameter).not.toBeUndefined();
			expect(strippedStepConfig.unknown_parameter).toBe("Unknown parameter");
		});

		it("should keep & strip based on sum of appended configs and then UI edits when comparing", function() {
			step.appendStepConfig({
				title: "Green step",
				description: "Green description",
				is_always_run: true
			});

			step.appendStepConfig({
				title: "Red step",
				summary: "Green summary",
				is_always_run: false
			});

			step.summary = "Blue summary";

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.title).toBeUndefined();
			expect(strippedStepConfig.summary).toBe("Blue summary");
			expect(strippedStepConfig.description).toBe("Green description");
			expect(strippedStepConfig.is_always_run).not.toBeUndefined();
			expect(strippedStepConfig.is_always_run).toBe(false);
		});

		it("should strip inputs which match the default, keep inputs which differ", function() {
			step.appendStepConfig({
				inputs: [{
					red_input: "new-red-input-value",
					opts: {
						title: "Red input title",
						description: "Red input description"
					}
				}, {
					green_input: "green-input-value",
					opts: {
						title: "Green input title"
					}
				}, {
					blue_input: "blue-input-value"
				}]
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.inputs.length).toBe(1);
			expect(strippedStepConfig.inputs[0].red_input).toBe("new-red-input-value");
		});

		it("should keep inputs even if only option of input differs from the default", function() {
			step.appendStepConfig({
				inputs: [{
					red_input: "red-input-value",
					opts: {
						title: "New red input title"
					}
				}]
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.inputs.length).toBe(1)
			expect(strippedStepConfig.inputs[0].opts.title).toBe("New red input title");
		});

		it("should keep stripped inputs when keeping inputs", function() {
			step.appendStepConfig({
				inputs: [{
					red_input: "red-input-value",
					opts: {
						title: "Red input title",
						description: "New red input description"
					}
				}]
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.inputs[0].opts.title).toBeUndefined();
			expect(strippedStepConfig.inputs[0].opts.description).not.toBeUndefined();
			expect(strippedStepConfig.inputs[0].opts.description).toBe("New red input description");
		});

		it("should strip inputs altogether when no input differs from the default", function() {
			step.appendStepConfig({
				inputs: [{
					red_input: "red-input-value"
				}]
			});

			expect(bitriseSteplibService.strippedStepConfigOfStep(step).inputs).toBeUndefined();
		});

		it("should keep inputs not found in the step", function() {
			step.appendStepConfig({
				inputs: [{
					unknown_input: "unknown-input-value",
					opts: {
						title: "Unknown input"
					}
				}]
			});

			var strippedStepConfig = bitriseSteplibService.strippedStepConfigOfStep(step);
			expect(strippedStepConfig.inputs.length).toBe(1);
			expect(strippedStepConfig.inputs[0].unknown_input).toBe("unknown-input-value");
			expect(strippedStepConfig.inputs[0].opts.title).toBe("Unknown input");
		});
	});

	describe("strippedVariableConfigOfVariable", function() {

		var defaultVariableConfig = {
			KEY: "RED-VALUE",
			opts: {
				title: "Red title",
				summary: "Red summary",
				description: "Red variable description",
				is_expand: true,
				is_required: true
			}
		};

		it("should keep value", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "GREEN-VALUE"
			});

			expect(bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig).KEY).toBe("GREEN-VALUE");
		});

		it("should keep value, even if it matches default value", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "RED-VALUE"
			});

			expect(bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig).KEY).toBe("RED-VALUE");
		});

		it("should strip options which match the default value", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "RED-VALUE",
				opts: {
					title: "Red title",
					description: "New red variable description"
				}
			});

			expect(bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig).opts.title).toBeUndefined();
		});

		it("should keep options which differ from the default value", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "RED-VALUE",
				opts: {
					title: "Green title"
				}
			});

			expect(bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig).opts.title).toBe("Green title");
		});

		it("should keep options not found in default config", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "GREEN-VALUE",
				opts: {
					unknown_opt: "unknown-opt-value"
				}
			});

			var strippedVariableConfig = bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig);

			expect(strippedVariableConfig.opts.unknown_opt).not.toBeUndefined();
			expect(strippedVariableConfig.opts.unknown_opt).toBe("unknown-opt-value");
		});

		it("should keep & strip based on sum of appended configs and then UI edits when comparing", function() {
			var variable = Variable.createFromVariableConfig({
				KEY: "GREEN-VALUE",
				opts: {
					title: "Green title",
					is_expand: false,
					is_required: true
				}
			});

			variable.appendVariableConfig({
				KEY: "BLUE-VALUE",
				opts: {
					is_expand: true,
					is_required: false
				}
			});

			variable.description = "Green variable description";

			var strippedVariableConfig = bitriseSteplibService.strippedVariableConfigOfVariable(variable, defaultVariableConfig);

			expect(strippedVariableConfig.KEY).toBe("BLUE-VALUE");
			expect(strippedVariableConfig.opts.title).toBe("Green title");
			expect(strippedVariableConfig.opts.is_expand).toBeUndefined();
			expect(strippedVariableConfig.opts.is_required).not.toBeUndefined();
			expect(strippedVariableConfig.opts.is_required).toBe(false);
			expect(strippedVariableConfig.opts.description).not.toBeUndefined();
			expect(strippedVariableConfig.opts.description).toBe("Green variable description");
		});

	});

});
