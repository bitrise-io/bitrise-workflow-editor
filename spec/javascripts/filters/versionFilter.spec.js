describe("VersionFilters", () => {
    let stepVersions;
    let mockStepSourceService;
    let mockStep;

    beforeEach(() => {
        mockStepSourceService = {
			versionsOfStep: jasmine.createSpy("extractWildcardVersions"),
		};

		module("BitriseWorkflowEditor");
		module(($provide) => {
			$provide.value("stepSourceService", mockStepSourceService);
        });

        mockStep = { isLibraryStep: () => true };
    });

    beforeEach(inject((_stepVersionsFilter_) => {
        stepVersions = _stepVersionsFilter_;
    }));

    describe("stepVersionsFilter", () => {
        it("should use stepSource service to calculate wildcard versions", () => {
            stepVersions(mockStep);
            expect(mockStepSourceService.versionsOfStep).toHaveBeenCalledWith(mockStep);
        });

        it("should include latest version and own version as well in the list if the step is a library step", () => {
            mockStepSourceService.versionsOfStep.and.returnValue(["2.0.x", "1.2.x", "1.1.1"]);

            const versions = stepVersions(mockStep);

            expect(versions).toEqual([null, "2.0.x", "1.2.x", "1.1.1"]);
        });

        it("should not include latest version in the list if the step is not library step", () => {
            mockStep.isLibraryStep = () => false;
            mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

            const versions = stepVersions(mockStep);

            expect(versions).toEqual(["1.2.x"]);
        });
    });
});