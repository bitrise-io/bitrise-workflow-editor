import { flatten, isNull } from 'underscore';

import { Step, Workflow } from '../models';
// eslint-disable-next-line import/no-cycle
import { WorkflowSelectionStore } from './workflow-selection-store';

export type WfChainWrapper = {
  workflow?: Workflow;
  isBeforeRunWorkflow?: boolean;
  isAfterRunWorkflow?: boolean;
  selectedWorkflowBeforeRunWorkflowIndex?: number;
  selectedWorkflowAfterRunWorkflowIndex?: number;
};

type WorkflowViewModel = {
  selectedWorkflow?: Workflow;
  workflows: Array<Workflow>;
  editedWorkflow?: Workflow;
  editWorkflowAtIndex: (arg0: number | null, shouldTransformEditedWorkflowToReact?: boolean) => void;
  stepSelected: (arg0: Step | undefined, wfIndex: number | undefined, scrollToStep: boolean) => void;
  deselectStep: () => void;
  selectedWorkflowChain: Array<WfChainWrapper>;
};

type AngularLocationService = {
  search: () => { workflow_id: string };
};

const wfChainWrapper = (wrapper: WfChainWrapper): WfChainWrapper => ({
  workflow: undefined,
  isBeforeRunWorkflow: true,
  isAfterRunWorkflow: false,
  selectedWorkflowBeforeRunWorkflowIndex: -1,
  selectedWorkflowAfterRunWorkflowIndex: -1,
  ...wrapper,
});

export class WorkflowsSelectionService {
  private store: WorkflowSelectionStore;

  private location: AngularLocationService;

  private static primaryWorkflowName = 'primary';

  constructor(store: WorkflowSelectionStore, locationService: AngularLocationService) {
    this.store = store;
    this.location = locationService;
  }

  private verifySelectedIndex = <T>(
    potentialIndex: number | null,
    list: Array<T> | null | undefined,
    checker: (arg0: T) => boolean,
  ): boolean => {
    if (isNull(potentialIndex) || !Number.isInteger(potentialIndex)) {
      return false;
    }

    const entity = list && list[potentialIndex];
    return !!entity && checker(entity);
  };

  findSelectedWorkflow = (viewModel: WorkflowViewModel): Workflow => {
    const idsTotry = [
      viewModel.selectedWorkflow?.id,
      this.store.lastSelectedWorkflowID,
      this.location.search().workflow_id,
      WorkflowsSelectionService.primaryWorkflowName,
    ];

    let selectedWf = null;
    let idIndex = 0;

    while (!selectedWf && idIndex < idsTotry.length) {
      const currentIndex = idIndex;
      selectedWf = viewModel.workflows.find((item) => item.id === idsTotry[currentIndex]);
      idIndex += 1;
    }

    return selectedWf || viewModel.workflows[0];
  };

  restoreSelection = (viewModel: WorkflowViewModel): void => {
    this.rearrangeSelection(
      viewModel,
      this.findSelectedWorkflow(viewModel),
      this.store.lastEditedWorkflowID || undefined,
    );

    if (
      this.verifySelectedIndex(
        this.store.lastEditedWorkflowIndex,
        viewModel.selectedWorkflowChain,
        this.store.checkLastSelectedWorkflow,
      )
    ) {
      viewModel.editWorkflowAtIndex(this.store.lastEditedWorkflowIndex);
    }

    const { editedWorkflow } = viewModel;

    if (
      this.store.lastSelectedStepIndex !== null &&
      this.verifySelectedIndex(
        this.store.lastSelectedStepIndex,
        editedWorkflow?.steps,
        this.store.checkLastSelectedStep,
      )
    ) {
      const step = editedWorkflow?.steps[this.store.lastSelectedStepIndex];
      const scrollToStep = !(this.store.lastEditedWorkflowIndex === 0 && this.store.lastSelectedStepIndex === 0);

      viewModel.stepSelected(step, undefined, scrollToStep);
    }
  };

  rearrangeSelection = (viewModel: WorkflowViewModel, wf?: Workflow, editedId?: string): void => {
    viewModel.selectedWorkflow = wf;

    // update selection chain
    viewModel.selectedWorkflowChain = [];

    if (!wf) {
      viewModel.editedWorkflow = undefined;
      viewModel.editWorkflowAtIndex(null);
      viewModel.deselectStep();
      return;
    }

    const constructWorkflowChain = (wfs: Array<Workflow> = [], before: boolean = true): Array<WfChainWrapper> =>
      flatten(
        wfs.map((innerWf: Workflow, index: number) =>
          innerWf.workflowChain(viewModel.workflows).map((aWorkflow: Workflow) =>
            wfChainWrapper({
              workflow: aWorkflow,
              isBeforeRunWorkflow: before,
              isAfterRunWorkflow: !before,
              selectedWorkflowBeforeRunWorkflowIndex: before && aWorkflow === innerWf ? index : -1,
              selectedWorkflowAfterRunWorkflowIndex: !before && aWorkflow === innerWf ? index : -1,
            }),
          ),
        ),
      );

    const beforeWfs = constructWorkflowChain(wf?.beforeRunWorkflows(viewModel.workflows), true);
    const afterWfs = constructWorkflowChain(wf?.afterRunWorkflows(viewModel.workflows), false);

    viewModel.selectedWorkflowChain.push(
      ...beforeWfs,
      wfChainWrapper({ workflow: viewModel.selectedWorkflow }),
      ...afterWfs,
    );

    // save it to the store
    editedId = editedId || wf?.id;

    let editedIndex = viewModel.selectedWorkflowChain.findIndex(({ workflow }) => workflow && workflow.id === editedId);
    if (editedIndex === -1) {
      editedIndex = viewModel.selectedWorkflowChain.findIndex(({ workflow }) => workflow && workflow.id === wf?.id);
    }

    viewModel.editWorkflowAtIndex(editedIndex, viewModel.editedWorkflow?.id !== editedId);
  };
}

export default (store: WorkflowSelectionStore, location: AngularLocationService): WorkflowsSelectionService =>
  new WorkflowsSelectionService(store, location);
