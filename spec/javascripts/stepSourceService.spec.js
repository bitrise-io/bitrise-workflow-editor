describe("stepSourceService", function () {
  let stepSourceService;
  const TEST_STEP_ID = "mockStep";
  const TEST_LIB_URL = "http://tempuri.org";
  const TEST_STEP_LATEST_CONFIG = {asset_urls: "test_urls", name: "2.2.1 config"};
  let mockSemverService, mockLogger, q, appService, stepLibSearchService;

  beforeEach(() => {
    mockSemverService = {
      extractWildcardVersions: jasmine.createSpy("extractWildcardVersions"),
      resolveVersion: jasmine.createSpy("resolveVersion"),
      shortenWildcardVersion: jasmine.createSpy("shortenWildcardVersion"),
      normalizeVersion: jasmine.createSpy("normalizeVersion"),
      findLatestMajorVersion: jasmine.createSpy("findLatestMajorVersion"),
    };

    mockLogger = {
      warn: jasmine.createSpy("warn"),
      error: jasmine.createSpy("error"),
    };

    q = {
      all: jasmine.createSpy("qAll"),
    };

    appService = {
      appConfig: {
        default_step_lib_source: TEST_LIB_URL,
      },
    };

    stepLibSearchService = {
      list: jasmine.createSpy("list").and.resolveTo({}),
    };

    module("BitriseWorkflowEditor");
    module(($provide) => {
      $provide.value("semverService", mockSemverService);
      $provide.value("logger", mockLogger);
      $provide.value("$q", q);
      $provide.value("appService", appService);
      $provide.value("stepLibSearchService", stepLibSearchService);
    });
  });

  beforeEach(inject((_stepSourceService_) => {
    stepSourceService = _stepSourceService_;
    stepSourceService.defaultLibraryURL = TEST_LIB_URL;

    stepSourceService.libraries = [
      {
        url: TEST_LIB_URL,
        steps: {
          [TEST_STEP_ID]: {
            "2.2.1": {defaultStepConfig: TEST_STEP_LATEST_CONFIG},
            "1.2.1": {defaultStepConfig: "1.2.1 config"},
            "1.1.1": {defaultStepConfig: "1.1.1 config"},
            "1.0.0": {defaultStepConfig: "1.0.0 config"},
          },
        },
        latestStepVersions: {
          [TEST_STEP_ID]: "2.2.1",
        },
      },
    ];
  }));

  describe("stepFromCVS", function () {
    it("should return local step", function () {
      expect(stepSourceService.stepFromCVS("path::path/to/step").localPath).not.toBeUndefined();
      expect(stepSourceService.stepFromCVS("path::path/to/step").localPath).toBe("path/to/step");
      expect(stepSourceService.stepFromCVS("path::path/to/step::another/path/to/step@1.0@2.0").localPath).toBe(
        "path/to/step::another/path/to/step@1.0",
      );
      expect(stepSourceService.stepFromCVS("path::::").localPath).toBe("::");
      expect(stepSourceService.stepFromCVS("path::::@1.0").localPath).toBe("::");
    });

    it("should raise error on invalid local step CVS", function () {
      expect(function () {
        stepSourceService.stepFromCVS("path::");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("path::@");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("path::@1.0");
      }).toThrow();
    });

    it("should return git step", function () {
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
        "git-url.git::another-git-url.git@1.0",
      );
    });

    it("should raise error on invalid git step CVS", function () {
      expect(function () {
        stepSourceService.stepFromCVS("git::");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("git::@");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("git::@1.0");
      }).toThrow();
    });

    it("should return library step", function () {
      mockSemverService.resolveVersion.and.returnValue("1.0.0");

      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).not.toBeUndefined();
      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe("library-url.git");
      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
      expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).libraryURL).toBe(
        "git@library-url.git",
      );
      expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).id).toBe(TEST_STEP_ID);
      expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}@1.0`).version).toBe("1.0");
      expect(stepSourceService.stepFromCVS(`git@library-url.git::${TEST_STEP_ID}`).version).toBeNull();
      expect(stepSourceService.stepFromCVS(`${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
      expect(stepSourceService.stepFromCVS(`::${TEST_STEP_ID}@1.0.0`).libraryURL).toBe(TEST_LIB_URL);
      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}`).version).toBeNull();
      expect(stepSourceService.stepFromCVS(`library-url.git::${TEST_STEP_ID}@`).version).toBeNull();
      expect(
        stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).libraryURL,
      ).toBe("library-url.git");
      expect(
        stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).id,
      ).toBe(`another-library-url.git::${TEST_STEP_ID}@1.0`);
      expect(
        stepSourceService.stepFromCVS(`library-url.git::another-library-url.git::${TEST_STEP_ID}@1.0@2.0`).version,
      ).toBe("2.0");
      expect(stepSourceService.stepFromCVS("library-url.git::@1.0@2.0").id).toBe("@1.0");
      expect(stepSourceService.stepFromCVS("library-url.git::@1.0@2.0").version).toBe("2.0");
    });

    it("should raise error on invalid library step CVS", function () {
      expect(function () {
        stepSourceService.stepFromCVS("::");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("::@");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("::@1.0");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("library-url::");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("library-url::@");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("library-url::@1.0");
      }).toThrow();
    });

    it("should raise error if library step has no library specified nor is default library specified", function () {
      stepSourceService.defaultLibraryURL = null;

      expect(function () {
        stepSourceService.stepFromCVS("${TEST_STEP_ID}@1.0");
      }).toThrow();
      expect(function () {
        stepSourceService.stepFromCVS("::${TEST_STEP_ID}@1.0");
      }).toThrow();
    });

    it("should be able to create wildcard version library steps", () => {
      mockSemverService.normalizeVersion.and.returnValue("1.x.x");
      mockSemverService.resolveVersion.and.returnValue("1.2.1");

      const step = stepSourceService.stepFromCVS(`${TEST_STEP_ID}@1`);

      expect(step.version).toEqual("1.x.x");
      expect(step.defaultStepConfig).toEqual("1.2.1 config");
    });

    it("Should log a warning for an invalid step version", () => {
      stepSourceService.stepFromCVS(`${TEST_STEP_ID}@invalid`);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Step is not configured",
        jasmine.objectContaining({stepCVS: `${TEST_STEP_ID}@invalid`, library: "http://tempuri.org"}),
      );
    });
  });

  describe("changeStepToVersion", () => {
    let MOCK_STEP;

    beforeEach(() => {
      MOCK_STEP = {
        id: TEST_STEP_ID,
        cvs: "MOCK_STEP@1.1.1",
        version: "1.1.1",
        defaultStepConfig: "1.1.1 config",
        libraryURL: "http://tempuri.org",
        isLibraryStep: () => true,
        isConfigured: () => true,
      };
    });

    it("should update step configs to wildcard change", () => {
      const newVersion = "2.x.x";
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
      const newVersion = "2.2.1";
      const latestMajorWildcard = "2.x.x";

      mockSemverService.findLatestMajorVersion.and.returnValue(latestMajorWildcard);
      mockSemverService.resolveVersion.and.returnValue(newVersion);
      mockSemverService.shortenWildcardVersion.and.returnValue("2");
      mockSemverService.normalizeVersion.and.returnValue(latestMajorWildcard);

      stepSourceService.changeStepToVersion(MOCK_STEP);

      expect(MOCK_STEP.version).toEqual(latestMajorWildcard);
      expect(MOCK_STEP.cvs).toEqual("MOCK_STEP@2");
      expect(MOCK_STEP.defaultStepConfig).toEqual(TEST_STEP_LATEST_CONFIG);
    });

    it("should not load step if version is not found", () => {
      const step = stepSourceService.stepFromCVS(`${TEST_STEP_ID}@fake_version`);
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
        isLibraryStep: () => true,
      };
    });

    it("should return null version if the step is local", () => {
      MOCK_STEP.isLibraryStep = () => false;
      MOCK_STEP.isLocal = () => true;

      const versions = stepSourceService.versionsOfStep(MOCK_STEP);

      expect(versions).toBeNull();
    });

    it("should return its own version if the step is github step", () => {
      MOCK_STEP.isLibraryStep = () => false;
      MOCK_STEP.isLocal = () => false;

      const versions = stepSourceService.versionsOfStep(MOCK_STEP);

      expect(versions).toEqual(["1.1.1"]);
    });

    it("should return null if the step is pointing to a wrong library and log an error", () => {
      MOCK_STEP.libraryURL = "http://this-does-not-exist";

      const versions = stepSourceService.versionsOfStep(MOCK_STEP);

      expect(versions).toBeNull();

      const error = new Error("Library not found for step");
      expect(mockLogger.error).toHaveBeenCalledWith(error);
    });

    it("should use existing step versions in the library to calculate wildcard ones", () => {
      const mockVersions = [null, "2.2.1"];
      mockSemverService.extractWildcardVersions.and.returnValue(mockVersions);

      const versions = stepSourceService.versionsOfStep(MOCK_STEP);
      expect(versions).toEqual(mockVersions);
      expect(mockSemverService.extractWildcardVersions).toHaveBeenCalledWith(MOCK_STEP, stepSourceService.libraries[0]);
    });
  });

  describe("isLatestStepVersion", () => {
    it("should return false for local step", () => {
      const isLatest = stepSourceService.isLatestStepVersion({
        isLibraryStep: () => false,
        isLocal: () => true,
      });

      expect(isLatest).toBeFalsy();
    });

    it("should return true for github step", () => {
      const isLatest = stepSourceService.isLatestStepVersion({
        isLibraryStep: () => false,
        isLocal: () => false,
      });

      expect(isLatest).toBeTruthy();
    });

    it("should check resolved versions for library steps", () => {
      const mockStep = {
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

  describe("resolveRequestedStepVersion", () => {
    let MOCK_STEP;

    beforeEach(() => {
      MOCK_STEP = {
        id: TEST_STEP_ID,
        version: "1.2.3",
        libraryURL: TEST_LIB_URL,
        isLibraryStep: () => true,
      };
    });

    it("should get library and call mock semver service", () => {
      mockSemverService.resolveVersion.and.returnValue("2.2.1");

      const actual = stepSourceService.resolveRequestedStepVersion("1.2.x", MOCK_STEP);
      expect(actual).toEqual("2.2.1");
    });

    it("should log if step version could not be resolved", () => {
      const actual = stepSourceService.resolveRequestedStepVersion("1.2.x", MOCK_STEP);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({
          id: TEST_STEP_ID,
          version: "1.2.3",
          requestedVersion: "1.2.x",
        }),
      );

      expect(actual).toBeUndefined();
    });
  });

  describe("loadStepsWithCVSs", () => {
    it("does not create any requests if all steps are already in the lib", () => {
      mockSemverService.resolveVersion.and.returnValue("2.2.1");

      stepSourceService.loadStepsWithCVSs([`${TEST_STEP_ID}@2.2.1`]);

      expect(q.all).toHaveBeenCalledWith([]);
    });

    it("calls stepLibSearchService if step is not found locally", () => {
      mockSemverService.resolveVersion.and.returnValue(false);

      stepSourceService.loadStepsWithCVSs([`${TEST_STEP_ID}@2.2.1`]);

      expect(q.all).toHaveBeenCalledWith([jasmine.any(Promise)]);
      expect(stepLibSearchService.list).toHaveBeenCalledWith({
        stepCVSs: [`${TEST_STEP_ID}@2.2.1`],
        includeInputs: true,
      });
    });
  });
});
