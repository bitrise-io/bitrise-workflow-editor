describe("VersionsFilter", () => {
    var stepVersionsFilter;
    var versionLabelFilter;
    var mockStepSourceService;

    beforeEach(() => {
        mockStepSourceService = {
            versionsOfStep: jasmine.createSpy("extractWildcardVersions"),
        };

        module("BitriseWorkflowEditor");
        module(($provide) => {
            $provide.value("stepSourceService", mockStepSourceService);
        });
    });

    beforeEach(inject((_stepVersionsFilter_, _versionLabelFilter_) => {
        stepVersionsFilter = _stepVersionsFilter_;
        versionLabelFilter = _versionLabelFilter_;
    }));

    describe("stepVersions filter", () => {
        it("should not duplicate latest version even if the step version is latest", () => {
            mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

            var versions = stepVersionsFilter({
                version: null,
                isLibraryStep: () => true,
            });

            expect(versions).toEqual([
                { label: null, disabled: true },
                { label: "1.2.x", disabled: false },
            ]);
        });

        it("should include latest version and own version as well in the list if the step is a library step", () => {
            mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

            var versions = stepVersionsFilter({
                version: "1.2.3",
                isLibraryStep: () => true,
            });

            expect(versions).toEqual([
                { label: null, disabled: true },
                { label: "1.2.3", disabled: true },
                { label: "1.2.x", disabled: false },
            ]);
        });

        it("should not include latest version in the list if the step is not library step", () => {
            mockStepSourceService.versionsOfStep.and.returnValue(["1.2.x"]);

            var versions = stepVersionsFilter({
                version: "1.2.3",
                isLibraryStep: () => false,
            });

            expect(versions).toEqual([
                { label: "1.2.3", disabled: true },
                { label: "1.2.x", disabled: false },
            ]);
        });
    });

    describe("versionLabel filter", () => {
        it("should use the specified version if given", () => {
            expect(versionLabelFilter({ label: "1.2.x" })).toEqual("1.2.x");
        });

        it("should use a text indicating latest update if version is not given", () => {
            expect(versionLabelFilter({ label: null })).toContain("latest");
        });
    });
});