import { create } from 'zustand';

type State = {
  stepIndex: number;
  workflowId: string;
  isDialogOpen?:
    | 'chain-workflow'
    | 'run-workflow'
    | 'create-workflow'
    | 'delete-workflow'
    | 'step-config-drawer'
    | 'step-selector-drawer'
    | 'workflow-config-drawer'
    | 'with-group-drawer'
    | 'step-bundle-drawer';
  dialogMounted: {
    'step-config-drawer'?: boolean;
    'workflow-config-drawer'?: boolean;
  };
};

type Action = {
  closeDialog: () => void;
  openCreateWorkflowDialog: () => void;
  openDeleteWorkflowDialog: () => void;
  openRunWorkflowDialog: (workflowId: string) => void;
  openChainWorkflowDialog: (workflowId: string) => void;
  openWorkflowConfigDrawer: (workflowId: string) => void;
  unmountWorkflowConfigDrawer: () => void;
  openStepConfigDrawer: (workflowId: string, stepIndex: number) => void;
  unmountStepConfigDrawer: () => void;
  openStepSelectorDrawer: (workflowId: string, stepIndex: number) => void;
  openWithGroupConfigDrawer: (workflowId: string, stepIndex: number) => void;
  openStepBundleDrawer: (workflowId: string, stepIndex: number) => void;
};

export const useWorkflowsPageStore = create<State & Action>((set) => ({
  stepIndex: -1,
  workflowId: '',
  isDialogOpen: undefined,
  dialogMounted: {
    'step-config-drawer': false,
    'workflow-config-drawer': false,
  },
  closeDialog: () => {
    return set(() => ({
      stepIndex: -1,
      workflowId: '',
      isDialogOpen: undefined,
    }));
  },
  openCreateWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'create-workflow' }));
  },
  openDeleteWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'delete-workflow' }));
  },
  openRunWorkflowDialog: (workflowId) => {
    return set(() => ({ workflowId, isDialogOpen: 'run-workflow' }));
  },
  openChainWorkflowDialog: (workflowId) => {
    return set(() => ({ workflowId, isDialogOpen: 'chain-workflow' }));
  },
  openWorkflowConfigDrawer: (workflowId) => {
    return set(() => ({
      workflowId,
      isDialogOpen: 'workflow-config-drawer',
      dialogMounted: { 'workflow-config-drawer': true },
    }));
  },
  unmountWorkflowConfigDrawer: () => {
    return set(() => ({
      dialogMounted: { 'workflow-config-drawer': false },
    }));
  },
  openStepConfigDrawer: (workflowId, stepIndex) => {
    return set(() => ({
      workflowId,
      stepIndex,
      isDialogOpen: 'step-config-drawer',
      dialogMounted: { 'step-config-drawer': true },
    }));
  },
  unmountStepConfigDrawer: () => {
    return set(() => ({
      dialogMounted: { 'step-config-drawer': false },
    }));
  },
  openStepSelectorDrawer: (workflowId, stepIndex) => {
    return set(() => ({
      workflowId,
      stepIndex,
      isDialogOpen: 'step-selector-drawer',
    }));
  },
  openWithGroupConfigDrawer: (workflowId, stepIndex) => {
    return set(() => ({
      workflowId,
      stepIndex,
      isDialogOpen: 'with-group-drawer',
    }));
  },
  openStepBundleDrawer: (workflowId, stepIndex) => {
    return set(() => ({
      workflowId,
      stepIndex,
      isDialogOpen: 'step-bundle-drawer',
    }));
  },
}));
