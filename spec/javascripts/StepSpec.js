describe("Step", function() {

	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Step_) {
		Step = _Step_;
	}));

	describe("isVerified", function() {

		it("should return undefined if source is not defined", function() {
			var step = new Step();

			expect(step.isVerified()).toBeUndefined();
		});

		it("should return true", function() {
			var step = new Step();

			step.sourceURL("https://www.github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("https://github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("www.github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("https://www.github.com/bitrise-steplib/red-step");
			expect(step.isVerified()).toBe(true);
		});

		it("should return false", function() {
			var step = new Step();

			step.sourceURL("https://www.github.com/red-user/red-step");
			expect(step.isVerified()).toBe(false);

			step.sourceURL("https://www.red.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(false);

			step.sourceURL("https://www.github.com/bitrise-io");
			expect(step.isVerified()).toBe(false);
		});

	});

	describe("requestedVersion", function() {

		it("should return null", function() {
			var step = new Step("red-step");
			step.version = "1.1";

			expect(step.requestedVersion()).toBeNull();
		});

		it("should return version of step", function() {
			var step = new Step("red-step@1.0");
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

		step.iconURL("icon-url");

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

		step.sourceURL("https://www.red.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("unknown");
	});

	it("should return a provider ID", function() {
		var step = new Step();

		step.sourceURL("https://www.github.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("github");

		step.sourceURL("https://bitbucket.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("bitbucket");

		step.sourceURL("gitlab.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("gitlab");
	});

});
