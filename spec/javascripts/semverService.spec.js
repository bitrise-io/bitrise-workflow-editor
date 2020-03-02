describe("SemverService", () => {
    let semverService;

    const TEST_STEP_ID = "mock_step";
    const mockCatalogue = {
        latestStepVersions: {
            "mock_step_2": "4.5.6",
            [TEST_STEP_ID]: "12.3.4"
        },
        steps: {
            [TEST_STEP_ID]: {
                "12.3.4": "...",
                "2.3.1": "...",
                "1.3.1": "...",
                "1.2.3": "...",
                "0.2.3": "...",
                "0.2.1": "...",
                "0.1.1": "...",
            },
            "mock_step_2": {
                "4.5.6": "...",
                "2.3.4": "...",
                "2.3.1": "...",
                "1.3.1": "...",
            }
        }
    };

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject((_semverService_) => {
        semverService = _semverService_;
    }));

    describe("shortenWildcardVersion", () => {
        it("should not touch general versions", () => {
            expect(semverService.shortenWildcardVersion("1.2.3")).toEqual("1.2.3");
        });

        it("should remove wildcard parts from version", () => {
            expect(semverService.shortenWildcardVersion("1.2.x")).toEqual("1.2");
            expect(semverService.shortenWildcardVersion("1.x.x")).toEqual("1");
        });

        it("should work for empty versions", () => {
            expect(semverService.shortenWildcardVersion()).toBeUndefined();
        });
    });

    describe("checkVersionPartsLocked", () => {
        it("should detect wildcard versions", () => {
            expect(semverService.checkVersionPartsLocked('1.2.x')).toBeTruthy();
            expect(semverService.checkVersionPartsLocked('1.x.x')).toBeTruthy();
            expect(semverService.checkVersionPartsLocked('12.3')).toBeFalsy();
            expect(semverService.checkVersionPartsLocked('12.3')).toBeFalsy();
        });

        it("should check for arbitrary locked parts", () => {
            expect(semverService.checkVersionPartsLocked('1.x.x', 2)).toBeTruthy();
            expect(semverService.checkVersionPartsLocked('1.x.x', 1)).toBeTruthy();
            expect(semverService.checkVersionPartsLocked('1.1.x', 2)).toBeFalsy();
            expect(semverService.checkVersionPartsLocked('1.1.2', 1)).toBeFalsy();
        });
    });

    describe("normalizeVersion", () => {
        it("should handle null versions", () => {
            expect(semverService.normalizeVersion()).toBeUndefined();
        });

        it("should not touch general versions", () => {
            expect(semverService.normalizeVersion("1.2.3")).toEqual("1.2.3");
        });

        it("should transform short versions to full wildcard form", () => {
            expect(semverService.normalizeVersion("1.2")).toEqual("1.2.x");
            expect(semverService.normalizeVersion("1")).toEqual("1.x.x");
        });
    });

    describe("extractWildcardVersions", () => {
        it("should add the step's own version to wildcard versions", () => {
            const mockStep = {
                id: TEST_STEP_ID,
                version: "1.2.1",
            };

            const wVersions = semverService.extractWildcardVersions(mockStep, mockCatalogue);

            expect(wVersions).toEqual([
                "12.3.x", "12.x.x", "2.3.x", "2.x.x", "1.3.x", "1.2.1", "1.2.x", "1.x.x", "0.2.x", "0.1.x", "0.x.x"
            ]);
        });

        it("should not contain wildcard duplicates", () => {
            const mockStep = {
                id: TEST_STEP_ID,
                version: "2.3.x",
            };

            var wVersions = semverService.extractWildcardVersions(mockStep, mockCatalogue);

            expect(wVersions).toEqual([
                "12.3.x", "12.x.x", "2.3.x", "2.x.x", "1.3.x", "1.2.x", "1.x.x", "0.2.x", "0.1.x", "0.x.x"
            ]);
        });

        it("should add the step's version at the beginning of the list if that is set to latest", () => {
            const mockStep = {
                id: TEST_STEP_ID,
                version: null,
            };

            const wVersions = semverService.extractWildcardVersions(mockStep, mockCatalogue);

            expect(wVersions).toEqual([
                null, "12.3.x", "12.x.x", "2.3.x", "2.x.x", "1.3.x", "1.2.x", "1.x.x", "0.2.x", "0.1.x", "0.x.x"
            ]);
        });
    });

    describe("resolveVersion", () => {
        const testCases = [
            ["0.2.1", "0.2.1"],
            ["0.2.x", "0.2.3"],
            ["1.x.x", "1.3.1"],
            ["x.x.x", "12.3.4"],
            ["12.x.x", "12.3.4"],
            ["1", "1.3.1"],         // partials should be interpreted as wildcards
            ["0", "0.2.3"],
            ["1.3", "1.3.1"],
            [null, "12.3.4"],
        ];

        _.forEach(testCases, (test) => {
            it(`should resolve ${test[0]} to ${test[1]} against the library`, () => {
                expect(semverService.resolveVersion(test[0], TEST_STEP_ID, mockCatalogue))
                    .toEqual(test[1]);
            });
        });
    });

    describe("findLatestMajorVersion", () => {
        it("should find latest major version locked for the step", () => {
            const mockStep = {
                id: TEST_STEP_ID,
                version: null,
            };

            const actualLatest = semverService.findLatestMajorVersion(mockStep, mockCatalogue);

            expect(actualLatest).toEqual("12.x.x");
        });
    });
});