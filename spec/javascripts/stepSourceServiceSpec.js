describe("stepSourceService", function() {

	var stepSourceService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_stepSourceService_) {
		stepSourceService = _stepSourceService_;
		stepSourceService.defaultLibraryURL = "default-library-url.git";
	}));

	describe("stepInfoFromCVS", function() {

		it("should return local step info", function() {
			expect(stepSourceService.stepInfoFromCVS("path::path/to/step").sourceType).toBe("local");
			expect(stepSourceService.stepInfoFromCVS("path::path/to/step").path).toBe("path/to/step");
			expect(stepSourceService.stepInfoFromCVS("path::path/to/step::another/path/to/step@1.0@2.0").path).toBe("path/to/step::another/path/to/step@1.0");
			expect(stepSourceService.stepInfoFromCVS("path::::").path).toBe("::");
			expect(stepSourceService.stepInfoFromCVS("path::::@1.0").path).toBe("::");
		});

		it("should raise error on invalid local step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("path::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("path::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("path::@1.0"); }).toThrow();
		});

		it("should return git step info", function() {
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").sourceType).toBe("git");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").gitURL).toBe("git-url.git");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").version).toBe("1.0");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0@").gitURL).toBe("git-url.git@1.0");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0@").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0@2.0").gitURL).toBe("git-url.git@1.0");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0@2.0").version).toBe("2.0");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git::another-git-url.git@1.0@2.0").gitURL).toBe("git-url.git::another-git-url.git@1.0");
		});

		it("should raise error on invalid git step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("git::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("git::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("git::@1.0"); }).toThrow();
		});

		it("should return library step info", function() {
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id@1.0").sourceType).toBe("library");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id@1.0").libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id@1.0").id).toBe("step-id");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id@1.0").version).toBe("1.0");
			expect(stepSourceService.stepInfoFromCVS("step-id@1.0").libraryURL).toBe("default-library-url.git");
			expect(stepSourceService.stepInfoFromCVS("::step-id@1.0").libraryURL).toBe("default-library-url.git");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("library-url.git::step-id@").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").id).toBe("another-library-url.git::step-id@1.0");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").version).toBe("2.0");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::@1.0@2.0").id).toBe("@1.0");
			expect(stepSourceService.stepInfoFromCVS("library-url.git::@1.0@2.0").version).toBe("2.0");
		});

		it("should raise error on invalid library step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("library-url::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("library-url::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("library-url::@1.0"); }).toThrow();
		});

		it("should raise error if library step has no library specified nor is default library specified", function() {
			stepSourceService.defaultLibraryURL = null;

			expect(function() { stepSourceService.stepInfoFromCVS("step-id@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::step-id@1.0"); }).toThrow();
		});

	});

});
