describe("stepSourceService", function() {

	var stepSourceService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_stepSourceService_) {
		stepSourceService = _stepSourceService_;
		stepSourceService.defaultCollectionURL = "default-collection-url.git";
	}));

	describe("stepInfoFromCVS", function() {

		it("should return local step info", function() {
			expect(stepSourceService.stepInfoFromCVS("path::path/to/step").sourceType).toBe("local");
			expect(stepSourceService.stepInfoFromCVS("path::path/to/step").path).toBe("path/to/step");
		});

		it("should raise error on invalid local step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("path::path/to/step::another/path/to/step"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("path::"); }).toThrow();
		});

		it("should return git step info", function() {
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").sourceType).toBe("git");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").gitURL).toBe("git-url.git");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@1.0").version).toBe("1.0");
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("git::git-url.git@").version).toBeNull();
		});

		it("should raise error on invalid git step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("git::git-url.git::another-git-url.git"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("git::git-url.git@1.0@2.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("git::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("git::@1.0"); }).toThrow();
		});

		it("should return collection step info", function() {
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id@1.0").sourceType).toBe("collection");
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id@1.0").collectionURL).toBe("collection-url.git");
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id@1.0").id).toBe("step-id");
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id@1.0").version).toBe("1.0");
			expect(stepSourceService.stepInfoFromCVS("step-id@1.0").collectionURL).toBe("default-collection-url.git");
			expect(stepSourceService.stepInfoFromCVS("::step-id@1.0").collectionURL).toBe("default-collection-url.git");
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id").version).toBeNull();
			expect(stepSourceService.stepInfoFromCVS("collection-url.git::step-id@").version).toBeNull();
		});

		it("should raise error on invalid collection step CVS", function() {
			expect(function() { stepSourceService.stepInfoFromCVS("collection-url::step-id::another-step-id@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("collection-url::step-id@1.0@2.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("::@1.0"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("collection-url::"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("collection-url::@"); }).toThrow();
			expect(function() { stepSourceService.stepInfoFromCVS("collection-url::@1.0"); }).toThrow();
		});

	});

});
