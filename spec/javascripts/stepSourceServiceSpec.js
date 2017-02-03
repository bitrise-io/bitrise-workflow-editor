describe("stepSourceService", function() {

	var stepSourceService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_stepSourceService_) {
		stepSourceService = _stepSourceService_;
		stepSourceService.defaultLibraryURL = "default-library-url.git";
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
			expect(stepSourceService.stepFromCVS("library-url.git::step-id@1.0").libraryURL).not.toBeUndefined();
			expect(stepSourceService.stepFromCVS("library-url.git::step-id@1.0").libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepFromCVS("library-url.git::step-id@1.0").id).toBe("step-id");
			expect(stepSourceService.stepFromCVS("library-url.git::step-id@1.0").version).toBe("1.0");
			expect(stepSourceService.stepFromCVS("step-id@1.0").libraryURL).toBe("default-library-url.git");
			expect(stepSourceService.stepFromCVS("::step-id@1.0").libraryURL).toBe("default-library-url.git");
			expect(stepSourceService.stepFromCVS("library-url.git::step-id").version).toBeNull();
			expect(stepSourceService.stepFromCVS("library-url.git::step-id@").version).toBeNull();
			expect(stepSourceService.stepFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").libraryURL).toBe("library-url.git");
			expect(stepSourceService.stepFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").id).toBe("another-library-url.git::step-id@1.0");
			expect(stepSourceService.stepFromCVS("library-url.git::another-library-url.git::step-id@1.0@2.0").version).toBe("2.0");
			expect(stepSourceService.stepFromCVS("library-url.git::@1.0@2.0").id).toBe("@1.0");
			expect(stepSourceService.stepFromCVS("library-url.git::@1.0@2.0").version).toBe("2.0");
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

	});

});
