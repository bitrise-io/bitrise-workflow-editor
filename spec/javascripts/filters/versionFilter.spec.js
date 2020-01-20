describe("VersionFilter", () => {
    var versionFilter;
    var mockStepSourceService;
    var mockStep;

    beforeEach(() => {
        mockStepSourceService = {
			versionsOfStep: jasmine.createSpy("extractWildcardVersions"),
		};

		module("BitriseWorkflowEditor");
		module(($provide) => {
			$provide.value("stepSourceService", mockStepSourceService);
        });

        mockStep = {
            version: "1.2.3",
            isLibraryStep: () => true,
        };
    });

    beforeEach(inject((_stepVersionsFilter_) => {
        versionFilter = _stepVersionsFilter_;
    }));

    it("should use stepSource service to calculate wildcard versions", () => {
        versionFilter(mockStep);
        expect(mockStepSourceService.versionsOfStep).toHaveBeenCalledWith(mockStep);
    });

    it("should include latest version and own version as well in the list if the step is a library step", () => {
        mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

        var versions = versionFilter(mockStep);

        expect(versions).toEqual([null, "1.2.3", "1.2.x"]);
    });

    it("should not include latest version in the list if the step is not library step", () => {
        mockStep.isLibraryStep = () => false;
        mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

        var versions = versionFilter(mockStep);

        expect(versions).toEqual(["1.2.3", "1.2.x"]);
    });
});