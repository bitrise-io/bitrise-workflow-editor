describe("WorkflowsSelectionService", () => {
  let selectionService;
  let mockStore;
  let mockLocationService;

  beforeEach(() => {
    module("BitriseWorkflowEditor");

    mockStore = {
      applyState: jasmine.createSpy("applyState"),
      checkLastSelectedWorkflow: jasmine.createSpy("checkLastSelectedWorkflow"),
      checkLastSelectedStep: jasmine.createSpy("checkLastSelectedStep"),
    };

    mockLocationService = {
      search: _.identity,
    };

    spyOn(mockLocationService, "search").and.returnValue({
      workflow_id: "test-location",
    });

    module(($provide) => {
      $provide.value("workflowSelectionStore", mockStore);
      $provide.value("$location", mockLocationService);
    });
  });

  beforeEach(inject((_workflowSelectionService_) => {
    selectionService = _workflowSelectionService_;
  }));

  describe("findSelectedWorkflow", () => {
    let mockVm = {
      workflows: [
        { id: "test-1" },
        { id: "test-2" },
        { id: "test-location" },
        { id: "primary" },
      ],
    };

    beforeEach(() => {
      mockStore.lastSelectedWorkflowID = null;
    });

    it("should check store to find workflow", () => {
      mockStore.lastSelectedWorkflowID = "test-2";

      const result = selectionService.findSelectedWorkflow(mockVm);
      expect(result).toEqual(mockVm.workflows[1]);
    });

    it("should check location to find workflow", () => {
      selectionService.findSelectedWorkflow(mockVm);
      expect(mockLocationService.search).toHaveBeenCalled();
    });

    it("should check primary name to find workflow", () => {
      mockVm = {
        workflows: [{ id: "test-1" }, { id: "test-2" }, { id: "primary" }],
      };

      const result = selectionService.findSelectedWorkflow(mockVm);
      expect(result).toEqual(mockVm.workflows[2]);
    });

    it("should fall back to first if nothing found", () => {
      mockVm = {
        workflows: [{ id: "test-1" }, { id: "test-2" }],
      };

      const result = selectionService.findSelectedWorkflow(mockVm);
      expect(result).toEqual(mockVm.workflows[0]);
    });
  });

  describe("restoreSelection", () => {
    let mockVm;

    beforeEach(() => {
      const workflows = [
        {
          id: "primary",
          beforeRunWorkflows: jasmine
            .createSpy("beforeRunWorkflows")
            .and.returnValue([]),
          afterRunWorkflows: jasmine
            .createSpy("afterRunWorkflows")
            .and.returnValue([]),
        },
      ];

      mockVm = {
        editWorkflowAtIndex: jasmine.createSpy("editWorkflowAtIndex"),
        stepSelected: jasmine.createSpy("stepSelected"),
        workflows: workflows,
      };

      mockStore.lastEditedWorkflowIndex = null;
    });

    it("should select workflow", () => {
      selectionService.restoreSelection(mockVm);
      expect(mockVm.selectedWorkflow).toBe(mockVm.workflows[0]);
    });

    it("should set edited workflow based on store check", () => {
      mockStore.checkLastSelectedWorkflow.and.returnValue(true);
      mockStore.lastEditedWorkflowIndex = 0;

      selectionService.restoreSelection(mockVm);

      expect(mockVm.editWorkflowAtIndex).toHaveBeenCalledWith(
        mockStore.lastEditedWorkflowIndex,
      );
    });

    it("should set selected step based on store check", () => {
      mockStore.lastSelectedStepIndex = 1;
      mockStore.checkLastSelectedStep.and.returnValue(true);
      mockVm.editedWorkflow = {
        steps: [{ id: "first-step" }, { id: "second-step" }],
      };

      selectionService.restoreSelection(mockVm);

      expect(mockVm.stepSelected).toHaveBeenCalledWith(
        mockVm.editedWorkflow.steps[1],
        undefined,
        true,
      );
    });

    it("should not set selected step if edited workflow could not be set", () => {
      mockVm.editedWorkflow = null;
      mockStore.lastSelectedStepIndex = 1;
      mockStore.checkLastSelectedStep.and.returnValue(true);

      selectionService.restoreSelection(mockVm);

      expect(mockVm.stepSelected).not.toHaveBeenCalled();
    });
  });

  describe("rearrangeSelection", () => {
    let mockWf;
    let mockVm;

    beforeEach(() => {
      mockVm = {
        workflows: [],
        editWorkflowAtIndex: jasmine.createSpy("editWorkflowAtIndex"),
      };

      mockWf = {
        id: "mock-wf",
        beforeRunWorkflows: jasmine.createSpy("beforeRunWorkflows"),
        afterRunWorkflows: jasmine.createSpy("afterRunWorkflows"),
      };
    });

    it("should set selected workflow and edit workflow as well", () => {
      mockWf.beforeRunWorkflows.and.returnValue([]);
      mockWf.afterRunWorkflows.and.returnValue([]);

      selectionService.rearrangeSelection(mockVm, mockWf);

      expect(mockVm.selectedWorkflow).toBe(mockWf);
      expect(mockVm.editWorkflowAtIndex).toHaveBeenCalledWith(0, true);
    });

    it("should set editedWorkflow different than selected if passed", () => {
      const mockedCopyWf = { ...mockWf, id: "test-before" };

      mockWf.beforeRunWorkflows.and.returnValue([
        {
          workflowChain: () => [mockedCopyWf],
        },
      ]);

      mockWf.afterRunWorkflows.and.returnValue([]);

      selectionService.rearrangeSelection(mockVm, mockWf, mockedCopyWf.id);

      expect(mockVm.selectedWorkflow).toBe(mockWf);
      expect(mockVm.editWorkflowAtIndex).toHaveBeenCalledWith(0, true);
    });

    it("should recalculate the selected workflow chain", () => {
      mockWf.beforeRunWorkflows.and.returnValue([
        {
          id: "before-1",
          workflowChain: () => [
            { id: "before-before-1" },
            { id: "before-1" },
            { id: "after-before-1" },
          ],
        },
        {
          id: "before-2",
          workflowChain: () => [
            { id: "before-before-2" },
            { id: "before-2" },
            { id: "after-before-2" },
          ],
        },
      ]);

      mockWf.afterRunWorkflows.and.returnValue([
        {
          id: "after-1",
          workflowChain: () => [
            { id: "before-after-1" },
            { id: "after-1" },
            { id: "after-after-1" },
          ],
        },
        {
          id: "after-2",
          workflowChain: () => [
            { id: "before-after-2" },
            { id: "after-2" },
            { id: "after-after-2" },
          ],
        },
      ]);

      selectionService.rearrangeSelection(mockVm, mockWf);

      expect(mockVm.selectedWorkflowChain[0].isBeforeRunWorkflow).toBeTrue();
      expect(mockVm.selectedWorkflowChain[7].isBeforeRunWorkflow).toBeFalse();
      expect(mockVm.selectedWorkflowChain[0].isAfterRunWorkflow).toBeFalse();
      expect(mockVm.selectedWorkflowChain[7].isAfterRunWorkflow).toBeTrue();

      const wfIds = mockVm.selectedWorkflowChain.map((wf) => wf.workflow.id);
      expect(wfIds).toEqual([
        "before-before-1",
        "before-1",
        "after-before-1",
        "before-before-2",
        "before-2",
        "after-before-2",
        "mock-wf",
        "before-after-1",
        "after-1",
        "after-after-1",
        "before-after-2",
        "after-2",
        "after-after-2",
      ]);
    });
  });
});
