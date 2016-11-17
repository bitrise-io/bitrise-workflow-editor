describe("Step", function() {

	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Step_) {
		Step = _Step_;
	}));

	describe("createFromStepConfig", function() {

		it("should return step", function() {
			var step = Step.createFromStepConfig({
				title: "Red title"
			});

			expect(step).toEqual(jasmine.any(Step));
			expect(step.id).toBeUndefined();
			expect(step.title).toBe("Red title");
			expect(step.description).toBeUndefined();
			expect(step.stepConfigs.length).toBe(1);
		});

		it("should return step without ID and version", function() {
			var step = Step.createFromStepConfig({
				id: "red-step-id",
				version: "1.0",
				description: "Red step description"
			});

			expect(step.id).toBeUndefined();
			expect(step.version).toBeUndefined();
			expect(step.stepConfigs.length).toBe(1);
			expect(step.stepConfigs[0].id).toBe("red-step-id");
		});

	});

	describe("appendStepConfig", function() {

		var step;
		beforeEach(function() {
			step = Step.createFromStepConfig({
				title: "Red title",
				description: "Red step description",
				inputs: [{
					red_input: "RED-VALUE",
					opts: {
						title: "Red input"
					}
				}, {
					blue_input: "BLUE-VALUE",
					opts: {
						title: "Blue input"
					}
				}]
			});
		});

		it("should change overridden value, keep others", function() {
			step.appendStepConfig({
				title: "Blue title"
			});

			expect(step.title).toBe("Blue title");
			expect(step.description).toBe("Red step description");
			expect(step.inputs.length).toBe(2);
			expect(step.inputs[0].key).toBe("red_input");
		});

		it("should have step configs stacked", function() {
			step.appendStepConfig({
				title: "Green title"
			});

			step.appendStepConfig({
				title: "Blue title"
			});

			expect(step.stepConfigs.length).toBe(3);
			expect(step.stepConfigs[0].title).toBe("Red title");
			expect(step.stepConfigs[1].title).toBe("Green title");
			expect(step.stepConfigs[2].title).toBe("Blue title");
		});

		it("should overwrite specified inputs", function() {
			step.appendStepConfig({
				inputs: [{
					red_input: "OTHER-RED-VALUE"
				}]
			});

			expect(step.inputs.length).toBe(2);
			expect(step.inputs[0].value).toBe("OTHER-RED-VALUE");
			expect(step.inputs[0].title).toBeUndefined();
			expect(step.inputs[1].value).toBe("BLUE-VALUE");
		});

		it("should insert not existing specified inputs", function() {
			step.appendStepConfig({
				inputs: [{
					green_input: "GREEN-VALUE"
				}]
			});

			expect(step.inputs.length).toBe(3);
			expect(step.inputs[2].value).toBe("GREEN-VALUE");
		});

	});

	describe("clear", function() {

		it("should clear step", function() {
			var step = Step.createFromStepConfig({
				title: "Red title"
			});

			step.appendStepConfig({
				title: "Green title",
				description: "Green description"
			});

			step.appendStepConfig({
				asset_urls: {
					"icon.svg": "icon-svg-url"
				}
			});

			step.clear();

			expect(step.title).toBeUndefined();
			expect(step.description).toBeUndefined();
			expect(step.iconURL).toBeUndefined();
			expect(step.stepConfigs.length).toBe(0);
		});

	});

	describe("isVerified", function() {

		it("should return undefined if source is not defined", function() {
			var step = Step.createFromStepConfig({
				title: "Red title"
			});

			expect(step.isVerified()).toBeUndefined();
		});

		it("should return true", function() {
			var step = new Step();

			step.sourceURL = "https://www.github.com/bitrise-io/red-step";
			expect(step.isVerified()).toBe(true);

			step.sourceURL = "https://github.com/bitrise-io/red-step";
			expect(step.isVerified()).toBe(true);

			step.sourceURL = "www.github.com/bitrise-io/red-step";
			expect(step.isVerified()).toBe(true);

			step.sourceURL = "github.com/bitrise-io/red-step";
			expect(step.isVerified()).toBe(true);

			step.sourceURL = "https://www.github.com/bitrise-steplib/red-step";
			expect(step.isVerified()).toBe(true);
		});

		it("should return false", function() {
			var step = new Step();

			step.sourceURL = "https://www.github.com/red-user/red-step";
			expect(step.isVerified()).toBe(false);

			step.sourceURL = "https://www.red.com/bitrise-io/red-step";
			expect(step.isVerified()).toBe(false);

			step.sourceURL = "https://www.github.com/bitrise-io";
			expect(step.isVerified()).toBe(false);
		});

	});

	describe("requestedVersion", function() {

		it("should return null", function() {
			var step = new Step();
			step.cvs = "red-step";
			step.version = "1.1";

			expect(step.requestedVersion()).toBeNull();
		});

		it("should return version of step", function() {
			var step = new Step();
			step.cvs = "red-step@1.0";
			step.version = "1.0";

			expect(step.requestedVersion()).toBe("1.0");
		});

	});

});

describe("normalizedStepIconURL", function() {

	var $filter;
	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_$filter_, _Step_) {
		$filter = _$filter_;
		Step = _Step_;
	}));

	it("should not return undefined", function() {
		var step = new Step();

		expect($filter("normalizedStepIconURL")(step)).not.toBeUndefined();

		step.iconURL = "icon-url";

		expect($filter("normalizedStepIconURL")(step)).not.toBeUndefined();
		expect($filter("normalizedStepIconURL")(step)).toBe("icon-url");
	});

});

describe("stepSourceCSSClass", function() {

	var $filter;
	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_$filter_, _Step_) {
		$filter = _$filter_;
		Step = _Step_;
	}));

	it("should return unknown", function() {
		var step = new Step();

		expect($filter("stepSourceCSSClass")(step)).toBe("unknown");

		step.sourceURL = "https://www.red.com/red-step"
		expect($filter("stepSourceCSSClass")(step)).toBe("unknown");
	});

	it("should return a provider ID", function() {
		var step = new Step();

		step.sourceURL = "https://www.github.com/red-step"
		expect($filter("stepSourceCSSClass")(step)).toBe("github");

		step.sourceURL = "https://bitbucket.com/red-step"
		expect($filter("stepSourceCSSClass")(step)).toBe("bitbucket");

		step.sourceURL = "gitlab.com/red-step"
		expect($filter("stepSourceCSSClass")(step)).toBe("gitlab");
	});

});
