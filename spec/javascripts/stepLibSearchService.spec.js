describe("stepLibSearchService", function() {
	var stepLibSearchService, mockStepLibSearchInstance;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_stepLibSearchService_) {
		stepLibSearchService = _stepLibSearchService_;
	}));
	beforeEach(inject(function(_stepLibSearchInstance_) {
		mockStepLibSearchInstance = _stepLibSearchInstance_;
	}));

	describe("list", () => {
		beforeEach(() => {
			spyOn(mockStepLibSearchInstance, "list").and.returnValue(Promise.resolve([]));
		});

		it("works with a given step list", () => {
			stepLibSearchService.list({ stepCVSs: ["a-step-cvs@1.0.0"], includeInputs: true });

			expect(mockStepLibSearchInstance.list).toHaveBeenCalledWith({
				stepIds: ["a-step-cvs@1.0.0"],
				includeInputs: true,
				latestOnly: false,
				algoliaOptions: {
					attributesToRetrieve: ["*"]
				}
			});
		});

		it("works with custom attributes", () => {
			stepLibSearchService.list({
				stepCVSs: ["a-step-cvs@1.0.0"],
				includeInputs: false,
				attributesToRetrieve: ["abc", "def"]
			});

			expect(mockStepLibSearchInstance.list).toHaveBeenCalledWith({
				stepIds: ["a-step-cvs@1.0.0"],
				includeInputs: false,
				latestOnly: false,
				algoliaOptions: {
					attributesToRetrieve: ["abc", "def"]
				}
			});
		});

		it("loads latest steps only", () => {
			stepLibSearchService.list({
				latestOnly: true
			});

			expect(mockStepLibSearchInstance.list).toHaveBeenCalledWith({
				stepIds: undefined,
				includeInputs: false,
				latestOnly: true,
				algoliaOptions: {
					attributesToRetrieve: ["*"]
				}
			});
		});
	});

	describe("getStepVersions", () => {
		beforeEach(() => {
			spyOn(mockStepLibSearchInstance, "list").and.returnValue(Promise.resolve([]));
		});

		it("works with a step id", () => {
			stepLibSearchService.getStepVersions("some-step");

			expect(mockStepLibSearchInstance.list).toHaveBeenCalledWith({
				query: "some-step",
				includeInputs: true,
				algoliaOptions: {
					attributesToRetrieve: ["*"]
				}
			});
		});

		it("works with custom attributes", () => {
			stepLibSearchService.getStepVersions("some-step", ["aaa", "bbb"]);

			expect(mockStepLibSearchInstance.list).toHaveBeenCalledWith({
				query: "some-step",
				includeInputs: true,
				algoliaOptions: {
					attributesToRetrieve: ["aaa", "bbb"]
				}
			});
		});
	});

	describe("convertSteps", () => {
		it("converts an array of steps to an object", async () => {
			spyOn(mockStepLibSearchInstance, "list").and.returnValue(
				Promise.resolve([
					{
						id: "some-step",
						version: "1.0.0",
						info: { a: "b" }
					},
					{
						id: "some-step",
						version: "1.1.0",
						info: { c: "d" }
					},
					{
						id: "some-other-step",
						version: "2.1.0",
						info: { e: "f" }
					}
				])
			);

			const converted = await stepLibSearchService.list({
				stepCVSs: ["does"],
				includeInputs: false,
				attributesToRetrieve: ["matter"]
			});

			expect(converted).toEqual({
				"some-step": {
					info: {
						a: "b",
						c: "d"
					},
					versions: {
						"1.0.0": {
							id: "some-step",
							version: "1.0.0",
							info: {
								a: "b"
							},
							a: "b"
						},
						"1.1.0": {
							id: "some-step",
							version: "1.1.0",
							info: {
								c: "d"
							},
							c: "d"
						}
					}
				},
				"some-other-step": {
					info: {
						e: "f"
					},
					versions: {
						"2.1.0": {
							id: "some-other-step",
							version: "2.1.0",
							info: {
								e: "f"
							},
							e: "f"
						}
					}
				}
			});
		});
	});
});
