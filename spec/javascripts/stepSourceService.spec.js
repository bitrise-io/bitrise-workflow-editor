describe("stepSourceService", function() {

	var stepSourceService;
	var TEST_STEP_ID = "mockStep";
	var TEST_LIB_URL = "http://tempuri.org";

	beforeEach(module("BitriseWorkflowEditor"));

	beforeEach(inject((_stepSourceService_) => {
		stepSourceService = _stepSourceService_;
		stepSourceService.defaultLibraryURL = TEST_LIB_URL;

		stepSourceService.libraries = [{
			url: TEST_LIB_URL,
			steps: {
				[TEST_STEP_ID]: {
					"2.2.1": { defaultStepConfig: { asset_urls: "test_urls", name: "2.2.1 config" }},
					"1.2.1": { defaultStepConfig: "1.2.1 config" },
					"1.1.1": { defaultStepConfig: "1.1.1 config" },
					"1.0.0": { defaultStepConfig: "1.0.0 config" },
				}
			},
			latestStepVersions: {
				[TEST_STEP_ID]: "2.2.1"
			}
		}];
	}));

	describe("stepFromCVS", function() {

		it("should return local step", function() {
			expect(stepSourceService.stepFromCVS("path::path/to/step").localPath).not.toBeUndefined();
			expect(stepSourceService.stepFromCVS("path::path/to/step").localPath).toBe("path/to/step");
			expect(stepSourceService.stepFromCVS("path::path/to/step::another/path/to/step@1.0@2.0").localPath).toBe("path/to/step::another/path/to/step@1.0");
			expect(stepSourceService.stepFromCVS("path::::").localPath).toBe("::");
			expect(stepSourceService.stepFromCVS("path::::@1.0").localPath).toBe("::");
		});

		it("should raise error on invalid local step CVS", function() {
			expect(function() { stepSourceService.stepFromCVS("path::"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("path::@"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("path::@1.0"); }).toThrow();
		});

		it("should return git step", function() {
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0").gitURL).not.toBeUndefined();
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0").gitURL).toBe("git-url.git");
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0").version).toBe("1.0");
			expect(stepSourceService.stepFromCVS("git::git-url.git").version).toBeNull();
			expect(stepSourceService.stepFromCVS("git::git-url.git@").version).toBeNull();
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0@").gitURL).toBe("git-url.git@1.0");
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0@").version).toBeNull();
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0@2.0").gitURL).toBe("git-url.git@1.0");
			expect(stepSourceService.stepFromCVS("git::git-url.git@1.0@2.0").version).toBe("2.0");
			expect(stepSourceService.stepFromCVS("git::git-url.git::another-git-url.git@1.0@2.0").gitURL).toBe("git-url.git::another-git-url.git@1.0");
		});

		it("should raise error on invalid git step CVS", function() {
			expect(function() { stepSourceService.stepFromCVS("git::"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("git::@"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("git::@1.0"); }).toThrow();
		});

		it("should return library step", function() {
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).not.toBeUndefined();
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe("git@library-url.git");
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}`).version).toBeNull();
			expect(stepSourceService.stepFromCVS(`${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
			expect(stepSourceService.stepFromCVS(`::${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}`).version).toBeNull();
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@`).version).toBeNull();
			expect(stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).id).toBe(`another-library-url.git::${TEST_STEP_ID}@1.0`);
			expect(stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).version).toBe("2.0");
			expect(stepSourceService.stepFromCVS(`library-url.git::@1.0@2.0`).id).toBe("@1.0");
			expect(stepSourceService.stepFromCVS(`library-url.git::@1.0@2.0`).version).toBe("2.0");
		});

		it("should raise error on invalid library step CVS", function() {
			expect(function() { stepSourceService.stepFromCVS("::"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("::@"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("::@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("library-url::"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("library-url::@"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("library-url::@1.0"); }).toThrow();
		});

		it("should raise error if library step has no library specified nor is default library specified", function() {
			stepSourceService.defaultLibraryURL = null;

			expect(function() { stepSourceService.stepFromCVS("step-id@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("::step-id@1.0"); }).toThrow();
		});

		it("should only configure asset path for steps with invalid version", () => {
			const step = stepSourceService.stepFromCVS(`${TEST_STEP_ID}@fake_version`);

			expect(step.userStepConfig.asset_urls).toEqual("test_urls");
			expect(step.defaultStepConfig).toBeUndefined();
		});
	});

	describe("versionsOfStep", () => {
		var MOCK_STEP;

		beforeEach(() => {
			MOCK_STEP = {
				id: TEST_STEP_ID,
				cvs: "MOCK_STEP@1.1.1",
				version: "1.1.1",
				defaultStepConfig: "1.1.1 config",
				libraryURL: "http://tempuri.org",
				isLibraryStep: () => true,
			};
		});

		it("should return null version if the step is local", () => {
			MOCK_STEP.isLibraryStep = () => false;
			MOCK_STEP.isLocal = () => true;

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);

			expect(versions).toBeNull();
		});

		it("should return its own version if the step is github step", () => {
			MOCK_STEP.isLibraryStep = () => false;
			MOCK_STEP.isLocal = () => false;

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);

			expect(versions).toEqual(["1.1.1"])
		});

		it("should return null if the step is pointing to a wrong library", () => {
			MOCK_STEP.libraryURL = "http://this-does-not-exist";

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);

			expect(versions).toBeNull();
		});

		it("should include step own version into the list", () => {
			MOCK_STEP.isLibraryStep = () => true;
			MOCK_STEP.version = "fake_version";

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);

			expect(versions).toEqual(["fake_version", "2.2.1", "1.2.1", "1.1.1", "1.0.0"]);
		});
	});

});
