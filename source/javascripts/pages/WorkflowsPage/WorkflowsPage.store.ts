import { create } from 'zustand';

type State = {
  stepIndex: number;
  workflowId: string;
  isDialogOpen?:
    | 'chain-workflow'
    | 'create-workflow'
    | 'delete-workflow'
    | 'step-config-drawer'
    | 'step-selector-drawer'
    | 'workflow-config-drawer';
};

type Action = {
  closeDialog: () => void;
  openCreateWorkflowDialog: () => void;
  openDeleteWorkflowDialog: () => void;
  openChainWorkflowDialog: (workflowId: string) => void;
  openWorkflowConfigDrawer: (workflowId: string) => void;
  openStepConfigDrawer: (workflowId: string, stepIndex: number) => void;
  openStepSelectorDrawer: (workflowId: string, stepIndex: number) => void;
};

export const useWorkflowsPageStore = create<State & Action>((set) => ({
  stepIndex: 0,
  workflowId: '',
  isDialogOpen: undefined,
  closeDialog: () => {
    return set(() => ({ isDialogOpen: undefined }));
  },
  openCreateWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'create-workflow' }));
  },
  openDeleteWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'delete-workflow' }));
  },
  openChainWorkflowDialog: (workflowId) => {
    return set(() => ({ workflowId, isDialogOpen: 'chain-workflow' }));
  },
  openWorkflowConfigDrawer: (workflowId) => {
    return set(() => ({ workflowId, isDialogOpen: 'workflow-config-drawer' }));
  },
  openStepConfigDrawer: (workflowId, stepIndex) => {
    return set(() => ({ workflowId, stepIndex, isDialogOpen: 'step-config-drawer' }));
  },
  openStepSelectorDrawer: (workflowId, stepIndex) => {
    return set(() => ({ workflowId, stepIndex, isDialogOpen: 'step-selector-drawer' }));
  },
}));
