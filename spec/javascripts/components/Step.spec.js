describe("Step", function() {

	var Step;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Step_) {
		Step = _Step_;
	}));

	var step;

	beforeEach(function() {
		step = new Step();
	});

	const fields = [
		{name: "title", config_name: "title"},
		{name: "summary", config_name: "summary"},
		{name: "description", config_name: "description"},
		{name: "assetUrls", config_name: "asset_urls"}
	];

	_.each(fields, (field) => {
		describe(`Getter/Setters: ${field.name}`, () => {
			var defaultStepConfig = {
				[field.config_name]: `Default ${field.name}`
			};

			it(`should return overridden ${field.name}`, () => {
				step.defaultStepConfig = defaultStepConfig;

				step.userStepConfig = {
					[field.config_name]: `New ${field.name}`
				};

				expect(step[field.name]()).toBe(`New ${field.name}`);
			});

			it(`should return default ${field.name} if not overridden`, () => {
				step.defaultStepConfig = defaultStepConfig;

				expect(step[field.name]()).toBe(`Default ${field.name}`);

				step.userStepConfig = {
					test: "New description"
				};

				expect(step[field.name]()).toBe(`Default ${field.name}`);
			});

			it(`should return undefined if nor default nor user defines ${field.name}`, () => {
				step.defaultStepConfig = {
					test: "Default description"
				};

				expect(step[field.name]()).toBeUndefined();
			});

			it(`should override ${field.name}`, () => {
				step.defaultStepConfig = defaultStepConfig;
				step.userStepConfig = {};

				expect(step[field.name](`New ${field.name}`)).toBe(`New ${field.name}`);
				expect(step.userStepConfig[field.config_name]).toBe(`New ${field.name}`);
			});

			it("should set user step config if not defined yet", () => {
				step.defaultStepConfig = defaultStepConfig;

				step[field.name](`New ${field.name}`);

				expect(step.userStepConfig).not.toBeUndefined();
				expect(step.userStepConfig[field.config_name]).toBe(`New ${field.name}`);
			});

			it("should remove title from user config if new is default", () => {
				step.defaultStepConfig = defaultStepConfig;

				expect(step[field.name](`New ${field.name}`)).toBe(`New ${field.name}`);
				expect(step[field.name](`Default ${field.name}`)).toBe(`Default ${field.name}`);
				expect(step.userStepConfig[field.config_name]).toBeUndefined();
				expect(step.defaultStepConfig[field.config_name]).toBe(`Default ${field.name}`);
			});
		});
	});

	describe("isValidTitle", function() {

		it("should return undefined if title is not defined", function() {
			expect(Step.isValidTitle(undefined)).toBeUndefined();
		});

		it("should return false if title is empty", function() {
			expect(Step.isValidTitle("")).toBeFalsy();
		});

		it("should return true", function() {
			expect(Step.isValidTitle("ABCdef")).toBeTruthy();
			expect(Step.isValidTitle("ABC1def")).toBeTruthy();
			expect(Step.isValidTitle("ABC.DEF")).toBeTruthy();
			expect(Step.isValidTitle("ABC DEF")).toBeTruthy();
			expect(Step.isValidTitle("ABC?DEF")).toBeTruthy();
		});

	});

	describe("iconURL", function() {
		it("should return default svg if no user step config is defined", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};

			expect(step.iconURL()).toBe("red-icon.svg");
		});

		it("should return default png if no svg and user step config is defined", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.png": "red-icon.png"
				}
			};

			expect(step.iconURL()).toBe("red-icon.png");
		});

		it("should return default svg even if default png is also defined", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg",
					"icon.png": "blue-icon.png"
				}
			};

			expect(step.iconURL()).toBe("red-icon.svg");
		});

		it("should return user defined svg if defined", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};
			step.userStepConfig = {
				asset_urls: {
					"icon.svg": "blue-icon.svg"
				}
			}

			expect(step.iconURL()).toBe("blue-icon.svg");
		});

		it("should return user defined png if defined", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};
			step.userStepConfig = {
				asset_urls: {
					"icon.png": "blue-icon.png"
				}
			}

			expect(step.iconURL()).toBe("blue-icon.png");
		});

		it("should set icon URL svg if no default nor user step config is defined", function() {
			expect(step.iconURL("red-icon.svg")).toBe("red-icon.svg");
			expect(step.defaultStepConfig).toBeUndefined();
			expect(step.userStepConfig).not.toBeUndefined();
			expect(step.userStepConfig.asset_urls).not.toBeUndefined();
			expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("red-icon.svg");
			expect(step.userStepConfig.asset_urls["icon.png"]).toBeUndefined();
		});

		it("should change icon URL svg", function() {
			step.userStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};

			step.iconURL("blue-icon.svg");

			expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("blue-icon.svg");
		});

		it("should keep png, add svg", function() {
			step.userStepConfig = {
				asset_urls: {
					"icon.png": "red-icon.png"
				}
			};

			step.iconURL("blue-icon.svg");

			expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("blue-icon.svg");
			expect(step.userStepConfig.asset_urls["icon.png"]).toBe("red-icon.png");
		});

		it("should not change anything if icon type is not supported", function() {
			step.userStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};

			step.iconURL("blue-icon.bmp");

			expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("red-icon.svg");
			expect(step.userStepConfig.asset_urls["icon.bmp"]).toBeUndefined();
		});

		it("should clear svg if is set to default", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};
			step.userStepConfig = {
				asset_urls: {
					"icon.svg": "blue-icon.svg",
					"icon.png": "blue-icon.png"
				}
			};

			step.iconURL("red-icon.svg");

			expect(step.userStepConfig.asset_urls["icon.svg"]).toBeUndefined();
		});

		it("should clear asset URLs if all icon URLs are set to default", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};
			step.userStepConfig = {
				title: "red-title",
				asset_urls: {
					"icon.svg": "blue-icon.svg"
				}
			};

			step.iconURL("red-icon.svg");

			expect(step.userStepConfig.asset_urls).toBeUndefined();
		});

		it("should clear user step config if all is set to default", function() {
			step.defaultStepConfig = {
				asset_urls: {
					"icon.svg": "red-icon.svg"
				}
			};
			step.userStepConfig = {
				asset_urls: {
					"icon.svg": "blue-icon.svg",
				}
			};

			step.iconURL("red-icon.svg");

			expect(step.userStepConfig).toEqual({});
		});

	});

	describe("verified", function() {
		it("should not be verified if there is no information exists", function() {
			expect(step.isVerified()).toBeFalsy();
		});
	})

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

	describe("cvsFromWrappedStepConfig", function() {

		it("should return CVS", function() {
			expect(Step.cvsFromWrappedStepConfig({
				"red-source::green-step@1.0": {
					title: "Green step"
				}
			})).toBe("red-source::green-step@1.0");
		});

	})

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

	it("should return set icon svg", function() {
		var step = new Step();

		step.iconURL("icon-url.svg");

		expect($filter("normalizedStepIconURL")(step)).toBe("icon-url.svg");
	});

	it("should return set icon png", function() {
		var step = new Step();

		step.iconURL("icon-url.png");

		expect($filter("normalizedStepIconURL")(step)).toBe("icon-url.png");
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
