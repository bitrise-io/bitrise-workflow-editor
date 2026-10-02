import {
  PipelinesPageDialogType,
  selectWorkflowConfigTarget,
  usePipelinesPageStore,
} from '@/pages/PipelinesPage/PipelinesPage.store';

// `spec/__mocks__/zustand.ts` only takes effect through `moduleDirectories`, where `node_modules`
// resolves first — so the real store is used here and dialog state has to be reset by hand.
beforeEach(() => {
  usePipelinesPageStore.setState({
    workflowId: '',
    parentWorkflowId: '',
    selectedStepIndices: [],
    openedDialogType: PipelinesPageDialogType.NONE,
    mountedDialogType: PipelinesPageDialogType.NONE,
    _nextDialog: undefined,
  });
});

const openWorkflowConfig = (workflowId: string, parentWorkflowId = '') => {
  usePipelinesPageStore.getState().openDialog({
    type: PipelinesPageDialogType.WORKFLOW_CONFIG,
    workflowId,
    parentWorkflowId,
  })();
};

describe('selectWorkflowConfigTarget', () => {
  it('returns undefined when no dialog is open', () => {
    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toBeUndefined();
  });

  it('returns undefined for other dialog types', () => {
    usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.STEP_CONFIG, workflowId: 'wf1' })();

    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toBeUndefined();
  });

  it('returns the target of the open workflow config dialog', () => {
    openWorkflowConfig('wf1');

    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toEqual({
      workflowId: 'wf1',
      parentWorkflowId: '',
    });
  });

  it('returns the target of a queued dialog, which the open one has not become yet', () => {
    usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.STEP_CONFIG, workflowId: 'wf1' })();
    openWorkflowConfig('wf2', 'wf1');

    // The queued dialog wins: openedDialogType is NONE while the step drawer animates out.
    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.NONE);
    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toEqual({
      workflowId: 'wf2',
      parentWorkflowId: 'wf1',
    });
  });
});

describe('closeWorkflowConfigDialog', () => {
  it('closes the workflow config dialog of the given workflow', () => {
    openWorkflowConfig('wf1');

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf1');

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.NONE);
  });

  it('leaves other dialog types open', () => {
    usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.STEP_CONFIG, workflowId: 'wf1' })();

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf1');

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.STEP_CONFIG);
  });

  it('leaves the dialog of another workflow open', () => {
    openWorkflowConfig('wf1');

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf2');

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.WORKFLOW_CONFIG);
  });

  it('distinguishes a chained workflow from the same workflow at the top level', () => {
    openWorkflowConfig('wf2', 'wf1');

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf2');

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.WORKFLOW_CONFIG);

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf2', 'wf1');

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.NONE);
  });

  it('cancels a matching queued dialog so it cannot pop open later', () => {
    usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.STEP_CONFIG, workflowId: 'wf1' })();
    openWorkflowConfig('wf2');

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf2');

    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toBeUndefined();

    // The replay on unmount has nothing left to open.
    usePipelinesPageStore.getState().unmountDialog();

    expect(usePipelinesPageStore.getState().openedDialogType).toBe(PipelinesPageDialogType.NONE);
  });

  it('keeps a queued dialog for another workflow', () => {
    usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.STEP_CONFIG, workflowId: 'wf1' })();
    openWorkflowConfig('wf2');

    usePipelinesPageStore.getState().closeWorkflowConfigDialog('wf3');

    expect(selectWorkflowConfigTarget(usePipelinesPageStore.getState())).toEqual({
      workflowId: 'wf2',
      parentWorkflowId: '',
    });
  });
});
