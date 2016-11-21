describe("Step", function() {

	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Step_) {
		Step = _Step_;
	}));

	describe("title", function() {

		var step;
		var defaultStepConfig = {
			title: "Default title"
		};

		beforeEach(function() {
			step = new Step();
		});

		it("should return overridden title", function() {
			step.defaultStepConfig = defaultStepConfig;

			step.userStepConfig = {
				title: "New title"
			};

			expect(step.title()).toBe("New title");
		});

		it("should return default title if not overridden", function() {
			step.defaultStepConfig = defaultStepConfig;

			expect(step.title()).toBe("Default title");

			step.userStepConfig = {
				description: "New description"
			};

			expect(step.title()).toBe("Default title");
		});

		it("should return undefined if no default nor user defines title", function() {
			expect(step.title()).toBeUndefined();
		});

		it("should override title", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.userStepConfig = {};

			step.title("New title");

			expect(step.title()).toBe("New title");
		});

		it("should set user step config if not defined yet", function() {
			step.defaultStepConfig = defaultStepConfig;

			step.title("New title");

			expect(step.userStepConfig).not.toBeUndefined();
			expect(step.title()).toBe("New title");
		});

		it("should remove title from user config if new is default", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.title("New title");
			step.title("Default title");

			expect(step.userStepConfig.title).toBeUndefined();
			expect(step.title()).toBe("Default title");
		});

	});

	describe("inputs", function() {

		var step;
		var defaultStepConfig = {
			inputs: [{
				red_key: "red_value",
				opts: {
					title: "Red title",
					description: "Red description"
				}
			}, {
				blue_key: "blue_value",
				opts: {
					title: "Blue title",
					description: "Blue description"
				}
			}]
		};

		beforeEach(function() {
			step = new Step();
		});

		it("should return default inputs", function() {
			step.defaultStepConfig = defaultStepConfig;

			expect(step.inputs().length).toBe(2);
			expect(step.inputs()[0].key()).toBe("red_key");
			expect(step.inputs()[0].value()).toBe("red_value");
			expect(step.inputs()[0].title()).toBe("Red title");
		});

		it("should return default inputs with overridden values where user overrides", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.userStepConfig = {
				inputs: [{
					red_key: "new_red_value"
				}]
			};

			expect(step.inputs().length).toBe(2);
			expect(step.inputs()[0].key()).toBe("red_key");
			expect(step.inputs()[0].value()).toBe("new_red_value");
			expect(step.inputs()[0].title()).toBe("Red title");
			expect(step.inputs()[1].key()).toBe("blue_key");
			expect(step.inputs()[1].value()).toBe("blue_value");
		});

		it("should return default inputs with overridden opts where user overrides", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.userStepConfig = {
				inputs: [{
					red_key: "red_value",
					opts: {
						title: "New red title"
					}
				}]
			};

			expect(step.inputs()[0].title()).toBe("New red title");
		});

		it("should drop user defined inputs which are not default inputs of the step", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.userStepConfig = {
				inputs: [{
					green_key: "new_green_value"
				}]
			};

			expect(step.inputs().length).toBe(2);
			expect(step.inputs()[0].value()).toBe("red_value");
			expect(step.inputs()[1].value()).toBe("blue_value");
		});

		it("should keep user defined inputs if step has no default config", function() {
			step.userStepConfig = {
				inputs: [{
					green_key: "new_green_value"
				}]
			};

			expect(step.inputs().length).toBe(1);
			expect(step.inputs()[0].key()).toBe("green_key");
			expect(step.inputs()[0].value()).toBe("new_green_value");
		});

		it("should return undefined if no default nor user defined config is set", function() {
			expect(step.inputs()).toBeUndefined();
		});

	});

	describe("outputs", function() {

		var step;
		var defaultStepConfig = {
			outputs: [{
				red_key: "red_value",
				opts: {
					title: "Red title",
					description: "Red description"
				}
			}, {
				blue_key: "blue_value",
				opts: {
					title: "Blue title",
					description: "Blue description"
				}
			}]
		};

		beforeEach(function() {
			step = new Step();
		});

		it("should return undefined if no default config is set", function() {
			expect(step.outputs()).toBeUndefined();
		});

		it("should return default outputs", function() {
			step.defaultStepConfig = defaultStepConfig;

			expect(step.outputs().length).toBe(2);
			expect(step.outputs()[0].key()).toBe("red_key");
			expect(step.outputs()[0].value()).toBe("red_value");
			expect(step.outputs()[1].key()).toBe("blue_key");
			expect(step.outputs()[1].value()).toBe("blue_value");
		});

		it("should return default outputs even if user tries to override them", function() {
			step.defaultStepConfig = defaultStepConfig;
			step.userStepConfig = {
				outputs: {
					red_key: "new_red_value",
					opts: {
						title: "New red title"
					}
				}
			};

			expect(step.outputs().length).toBe(2);
			expect(step.outputs()[0].value()).toBe("red_value");
			expect(step.outputs()[0].title()).toBe("Red title");
		});

	});

	describe("isVerified", function() {

		var step;
		beforeEach(function() {
			step = new Step();
		});

		it("should return undefined if source is not defined", function() {
			expect(step.isVerified()).toBeUndefined();
		});

		it("should return true if is from bitrise-io on GitHub", function() {
			step.sourceURL("https://www.github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("https://github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("www.github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);

			step.sourceURL("github.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(true);
		});

		it("should return true if is from bitrise-steplib on GitHub", function() {
			step.sourceURL("https://www.github.com/bitrise-steplib/red-step");
			expect(step.isVerified()).toBe(true);
		});

		it("should return false if is from any other user or host", function() {
			step.sourceURL("https://www.github.com/red-user/red-step");
			expect(step.isVerified()).toBe(false);

			step.sourceURL("https://www.red.com/bitrise-io/red-step");
			expect(step.isVerified()).toBe(false);
		});

	});

	describe("requestedVersion", function() {

		it("should return null if cvs requests version to always latest", function() {
			var step = new Step("red-step");

			expect(step.requestedVersion()).toBeNull();

			step.version = "1.1";

			expect(step.requestedVersion()).toBeNull();
		});

		it("should return cvs requested version of step", function() {
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

	it("should return undefined if step is not defined", function() {
		expect($filter("normalizedStepIconURL")()).toBeUndefined();
	});

	it("should return default icon URL if step icon is not defined", function() {
		var step = new Step();

		expect($filter("normalizedStepIconURL")(step)).not.toBeUndefined();
	});

	it("should return set icon", function() {
		var step = new Step();

		step.iconURL("icon-url");

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

	it("should return undefined if step is not defined", function() {
		expect($filter("stepSourceCSSClass")()).toBeUndefined();
	});

	it("should return a provider css class if source URL matches one", function() {
		var step = new Step();

		step.sourceURL("https://www.github.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("github");

		step.sourceURL("https://bitbucket.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("bitbucket");

		step.sourceURL("gitlab.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("gitlab");
	});

	it("should return unknown if source URL doesn't match any providers", function() {
		var step = new Step();

		step.sourceURL("https://www.red.com/red-step");
		expect($filter("stepSourceCSSClass")(step)).toBe("unknown");
	});

});
