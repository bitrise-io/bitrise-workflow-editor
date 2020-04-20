describe("Workflow selection store", () => {
	let selectionStore;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(_workflowSelectionStore_ => {
		selectionStore = _workflowSelectionStore_;

		// selection store is singleton
		selectionStore.reset();
	}));

	it("should have required properties", () => {
		expect(selectionStore).toEqual(
			jasmine.objectContaining({
				lastSelectedWorkflowID: null,
				lastEditedWorkflowID: null,
				lastEditedWorkflowIndex: null,
				lastSelectedStepCVS: null,
				lastSelectedStepIndex: null
			})
		);
	});

	it("should be able to reset properties", () => {
		selectionStore.lastSelectedWorkflowID = 5;
		selectionStore.lastEditedWorkflowIndex = 10;

		selectionStore.reset();

		expect(selectionStore.lastSelectedWorkflowID).toBeNull();
		expect(selectionStore.lastEditedWorkflowIndex).toBeNull();
	});

	describe("applyState", () => {
		const mockStep = {
			id: "mockStep",
			cvs: "mockStep@1.1"
		};

		const mockWorkflow = {
			id: "wf1",
			steps: [mockStep]
		};

		beforeEach(() => {
			selectionStore.enable();
		});

		it("should set properties based on values passed", () => {
			selectionStore.applyState({
				lastSelectedWorkflow: mockWorkflow,
				lastEditedWorkflow: mockWorkflow,
				lastEditedWorkflowIndex: 10,
				lastSelectedStep: mockStep
			});

			expect(selectionStore).toEqual(
				jasmine.objectContaining({
					lastSelectedWorkflowID: "wf1",
					lastEditedWorkflowID: "wf1",
					lastEditedWorkflowIndex: 10,
					lastSelectedStepCVS: "mockStep@1.1",
					lastSelectedStepIndex: 0
				})
			);
		});

		it("should be able to partially apply", () => {
			selectionStore.applyState({ lastSelectedWorkflow: mockWorkflow });

			expect(selectionStore).toEqual(
				jasmine.objectContaining({
					lastSelectedWorkflowID: "wf1",
					lastEditedWorkflowID: null,
					lastEditedWorkflowIndex: null,
					lastSelectedStepCVS: null,
					lastSelectedStepIndex: null
				})
			);
		});

		it("should not work when disabled", () => {
			selectionStore.disable();
			selectionStore.applyState({ lastSelectedWorkflow: mockWorkflow });

			expect(selectionStore.lastSelectedWorkflowID).toBeNull();

			selectionStore.enable();
			selectionStore.applyState({ lastSelectedWorkflow: mockWorkflow });

			expect(selectionStore.lastSelectedWorkflowID).toEqual("wf1");
		});
	});
});
