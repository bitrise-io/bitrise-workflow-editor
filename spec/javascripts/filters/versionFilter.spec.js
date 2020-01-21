describe("VersionFilters", () => {
    let stepVersionsFilter;
    let versionLabelFilter;
    let isVersionDisabledFilter;
    let mockStepSourceService;
    let mockSemverService;
    let mockStep;

    beforeEach(() => {
        mockStepSourceService = {
            versionsOfStep: jasmine.createSpy("extractWildcardVersions"),
        };

        mockSemverService = {
            isVersionWildcard: jasmine.createSpy("isVersionWildcard"),
        };

        module("BitriseWorkflowEditor");
        module(($provide) => {
            $provide.value("stepSourceService", mockStepSourceService);
            $provide.value("semverService", mockSemverService);
        });

        mockStep = { isLibraryStep: () => true };
    });

    beforeEach(inject((_stepVersionsFilter_, _versionLabelFilter_, _isVersionDisabledFilter_) => {
        stepVersionsFilter = _stepVersionsFilter_;
        versionLabelFilter = _versionLabelFilter_;
        isVersionDisabledFilter = _isVersionDisabledFilter_;
    }));

    describe("stepVersionsFilter", () => {
        it("should use stepSource service to calculate wildcard versions", () => {
            stepVersionsFilter(mockStep);
            expect(mockStepSourceService.versionsOfStep).toHaveBeenCalledWith(mockStep);
        });

        it("should not include latest version in the list if the step is not library step", () => {
            mockStep.isLibraryStep = () => false;
            mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

            const versions = stepVersionsFilter(mockStep);

            expect(versions).toEqual(["1.2.x"]);
        });
    });

    describe("versionLabel", () => {
        it("should display version str if set", () => {
            expect(versionLabelFilter("test-version")).toEqual("test-version");
        });

        it("should display latest version if version descriptor not set", () => {
            expect(versionLabelFilter(null)).toContain("latest");
        });
    });

    describe("isVersionDisabled", () => {
        it("should return disable if version is not wildcard", () => {
            mockSemverService.isVersionWildcard.and.returnValue(false);
            expect(isVersionDisabledFilter("test-version-non-wildcard")).toBeTruthy();

            mockSemverService.isVersionWildcard.and.returnValue(true);
            expect(isVersionDisabledFilter("test-version-wildcard")).toBeFalsy();
        });
    });
});