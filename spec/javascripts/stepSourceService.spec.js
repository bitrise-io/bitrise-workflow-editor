describe("stepSourceService", function() {
	var stepSourceService;
	var TEST_STEP_ID = "mockStep";
	var TEST_LIB_URL = "http://tempuri.org";
	var TEST_STEP_LATEST_CONFIG = { asset_urls: "test_urls", name: "2.2.1 config" };
	var mockSemverService;

	beforeEach(() => {
		mockSemverService = {
			extractWildcardVersions: jasmine.createSpy("extractWildcardVersions"),
			resolveVersion: jasmine.createSpy("resolveVersion"),
			shortenWildcardVersion: jasmine.createSpy("shortenWildcardVersion"),
			normalizeVersion: jasmine.createSpy("normalizeVersion"),
		};

		module("BitriseWorkflowEditor");
		module(($provide) => {
			$provide.value("semverService", mockSemverService);
		});
	});

	beforeEach(inject((_stepSourceService_) => {
		stepSourceService = _stepSourceService_;
		stepSourceService.defaultLibraryURL = TEST_LIB_URL;

		stepSourceService.libraries = [{
			url: TEST_LIB_URL,
			steps: {
				[TEST_STEP_ID]: {
					"2.2.1": { defaultStepConfig: { asset_urls: "test_urls", name: "2.2.1 config" } },
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
			expect(stepSourceService.stepFromCVS("path::path/to/step::another/path/to/step@1.0@2.0").localPath).toBe(
				"path/to/step::another/path/to/step@1.0"
			);
			expect(stepSourceService.stepFromCVS("path::::").localPath).toBe("::");
			expect(stepSourceService.stepFromCVS("path::::@1.0").localPath).toBe("::");
		});

		it("should raise error on invalid local step CVS", function() {
			expect(function() {
				stepSourceService.stepFromCVS("path::");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("path::@");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("path::@1.0");
			}).toThrow();
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
			expect(stepSourceService.stepFromCVS("git::git-url.git::another-git-url.git@1.0@2.0").gitURL).toBe(
				"git-url.git::another-git-url.git@1.0"
			);
		});

		it("should raise error on invalid git step CVS", function() {
			expect(function() {
				stepSourceService.stepFromCVS("git::");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("git::@");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("git::@1.0");
			}).toThrow();
		});

		it("should return library step", function() {
			mockSemverService.resolveVersion.and.returnValue("1.0.0");

			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).not.toBeUndefined();
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe(
				"git@library-url.git"
			);
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
			expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}`).version).toBeNull();
			expect(stepSourceService.stepFromCVS(`${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
			expect(stepSourceService.stepFromCVS(`::${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}`).version).toBeNull();
			expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@`).version).toBeNull();
			expect(
				stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).libraryURL
			).toBe("library-url.git");
			expect(
				stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).id
			).toBe(`another-library-url.git::${TEST_STEP_ID}@1.0`);
			expect(
				stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).version
			).toBe("2.0");
			expect(stepSourceService.stepFromCVS(`library-url.git::@1.0@2.0`).id).toBe("@1.0");
			expect(stepSourceService.stepFromCVS(`library-url.git::@1.0@2.0`).version).toBe("2.0");
		});

		it("should raise error on invalid library step CVS", function() {
			expect(function() {
				stepSourceService.stepFromCVS("::");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("::@");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("::@1.0");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("library-url::");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("library-url::@");
			}).toThrow();
			expect(function() {
				stepSourceService.stepFromCVS("library-url::@1.0");
			}).toThrow();
		});

		it("should raise error if library step has no library specified nor is default library specified", function() {
			stepSourceService.defaultLibraryURL = null;

			expect(function() { stepSourceService.stepFromCVS("${TEST_STEP_ID}@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepFromCVS("::${TEST_STEP_ID}@1.0"); }).toThrow();
		});

		it("should be able to create wildcard version library steps", () => {
			mockSemverService.normalizeVersion.and.returnValue("1.x.x");
			mockSemverService.resolveVersion.and.returnValue("1.2.1");

			var step = stepSourceService.stepFromCVS(`${TEST_STEP_ID}@1`);

			expect(step.version).toEqual("1.x.x");
			expect(step.defaultStepConfig).toEqual("1.2.1 config");
		});
	});

	describe("changeStepToVersion", () => {
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

		it("should update step configs to wildcard change", () => {
			var newVersion = "2.x.x";
			mockSemverService.resolveVersion.and.returnValue("2.2.1");
			mockSemverService.shortenWildcardVersion.and.returnValue("2");
			mockSemverService.normalizeVersion.and.returnValue(newVersion);

			stepSourceService.changeStepToVersion(MOCK_STEP, newVersion);

			expect(MOCK_STEP.version).toEqual(newVersion);
			expect(MOCK_STEP.cvs).toEqual("MOCK_STEP@2");
			expect(MOCK_STEP.defaultStepConfig).toEqual(TEST_STEP_LATEST_CONFIG);
		});

		it("should not do anything if the step is not library step", () => {
			MOCK_STEP.isLibraryStep = () => false;

			stepSourceService.changeStepToVersion(MOCK_STEP, "1.2.x");

			expect(MOCK_STEP.defaultStepConfig).toEqual("1.1.1 config");
		});

		it("should set latest if the passed version is null", () => {
			var newVersion = "2.2.1";

			mockSemverService.resolveVersion.and.returnValue(newVersion);
			mockSemverService.normalizeVersion.and.returnValue(newVersion);

			stepSourceService.changeStepToVersion(MOCK_STEP, null);

			expect(MOCK_STEP.version).toEqual(newVersion);
			expect(MOCK_STEP.cvs).toEqual("MOCK_STEP");
			expect(MOCK_STEP.defaultStepConfig).toEqual(TEST_STEP_LATEST_CONFIG);
		});

		it("should only configure asset path for steps with invalid version", () => {
			const step = stepSourceService.stepFromCVS(`${TEST_STEP_ID}@fake_version`);

			expect(step.userStepConfig.asset_urls).toEqual("test_urls");
			expect(step.defaultStepConfig).toBeUndefined();
		});
	});

	describe("versionsOfStep", () => {
		let MOCK_STEP;

		beforeEach(() => {
			MOCK_STEP = {
				id: TEST_STEP_ID,
				cvs: "MOCK_STEP@1.1.1",
				version: "1.1.1",
				defaultStepConfig: "1.1.1 config",
				libraryURL: TEST_LIB_URL,
				isLibraryStep: () => true
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

			expect(versions).toEqual(["1.1.1"]);
		});

		it("should return null if the step is pointing to a wrong library", () => {
			MOCK_STEP.libraryURL = "http://this-does-not-exist";

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);

			expect(versions).toBeNull();
		});

		it("should use existing step versions in the library to calculate wildcard ones", () => {
			const mockVersions = [null, "2.2.1"];
			mockSemverService.extractWildcardVersions.and.returnValue(mockVersions);

			var versions = stepSourceService.versionsOfStep(MOCK_STEP);
			expect(versions).toEqual(mockVersions);
			expect(mockSemverService.extractWildcardVersions).toHaveBeenCalledWith(MOCK_STEP, stepSourceService.libraries[0]);
		});
	});

	describe("isLatestStepVersion", () => {
		it("should return false for local step", () => {
			var isLatest = stepSourceService.isLatestStepVersion({
				isLibraryStep: () => false,
				isLocal: () => true,
			});

			expect(isLatest).toBeFalsy();
		});

		it("should return true for github step", () => {
			var isLatest = stepSourceService.isLatestStepVersion({
				isLibraryStep: () => false,
				isLocal: () => false,
			});

			expect(isLatest).toBeTruthy();
		});

		it("should check resolved versions for library steps", () => {
			var mockStep = {
				id: TEST_STEP_ID,
				isLibraryStep: () => true,
				libraryURL: TEST_LIB_URL,
			};

			mockSemverService.resolveVersion.and.returnValue("1.3.4");
			expect(stepSourceService.isLatestStepVersion(mockStep)).toBeFalsy();

			mockSemverService.resolveVersion.and.returnValue("2.2.1");
			expect(stepSourceService.isLatestStepVersion(mockStep)).toBeTruthy();
		});
	});
});
