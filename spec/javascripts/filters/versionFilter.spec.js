describe("VersionFilters", () => {
	let stepVersionsFilter;
	let versionLabelFilter;
	let verInfoFilter;
	let verOptsfilter;
	let mockStepSourceService;
	let mockSemverService;
	let mockStep;

	beforeEach(() => {
		mockStepSourceService = {
			versionsOfStep: jasmine.createSpy("extractWildcardVersions"),
			latestVersion: jasmine.createSpy("latestVersion")
		};

		mockSemverService = {
			checkVersionPartsLocked: jasmine.createSpy("checkVersionPartsLocked")
		};

		module("BitriseWorkflowEditor");
		module($provide => {
			$provide.value("stepSourceService", mockStepSourceService);
			$provide.value("semverService", mockSemverService);
			$provide.value("resolveVersionFilter", _.identity);
			$provide.constant("STRINGS_VERSION", {
				versionText: "mock_version <version>",
				branchText: "mock_branch <version>",
				latestVersionText: "latest_version <latest_version>",
				exactVersionRemark: "exact_version <version>",
				patchUpdatesRemark: "patch_update",
				minorUpdateRemarks: "minor_update"
			});
		});

		mockStep = { isLibraryStep: () => true };
	});

	beforeEach(inject((
		_stepVersionsFilter_,
		_versionLabelFilter_,
		_versionInfoStringsFilter_,
		_versionSelectorOptionsFilter_
	) => {
		stepVersionsFilter = _stepVersionsFilter_;
		versionLabelFilter = _versionLabelFilter_;
		verInfoFilter = _versionInfoStringsFilter_;
		verOptsfilter = _versionSelectorOptionsFilter_;
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

	describe("versionInfoStrings", () => {
		it("should calculate version text for git steps", () => {
			const { versionText } = verInfoFilter({ isVCSStep: () => true }, "#branch");
			expect(versionText).toEqual("mock_branch #branch");
		});

		it("should calculate version text for library steps", () => {
			const { versionText } = verInfoFilter({ isVCSStep: () => false }, "1.2");
			expect(versionText).toEqual("mock_version 1.2");
		});

		it("should calculate latest version text", () => {
			mockStepSourceService.latestVersion.and.returnValue("1.5");

			const { latestVersionText } = verInfoFilter({ isVCSStep: () => false }, "1.2");
			expect(latestVersionText).toEqual("latest_version 1.5");
		});
	});

	describe("versionSelectorOptions", () => {
		it("should put an update to result", () => {
			const mockUpdater = jasmine.createSpy("updater");
			const { onUpdateVersion } = verOptsfilter({}, mockUpdater);
			expect(onUpdateVersion).toEqual(mockUpdater);
		});

		it("should support patch versions", () => {
			mockSemverService.checkVersionPartsLocked
				.withArgs("1.2.x", 2)
				.and.returnValue(false)
				.withArgs("1.2.x", 1)
				.and.returnValue(true);

			const {
				strings: { versionRemark }
			} = verOptsfilter({ version: "1.2.x" });
			expect(versionRemark).toEqual("patch_update");
		});

		it("should support minor versions", () => {
			mockSemverService.checkVersionPartsLocked
				.withArgs("1.x", 2)
				.and.returnValue(true)
				.withArgs("1.x", 1)
				.and.returnValue(false);

			const {
				strings: { versionRemark }
			} = verOptsfilter({ version: "1.x" });
			expect(versionRemark).toEqual("minor_update");
		});

		it("should support exact versions", () => {
			const {
				strings: { versionRemark }
			} = verOptsfilter({ version: "1.2.3" });
			expect(versionRemark).toEqual("exact_version 1.2.3");
		});
	});
});
