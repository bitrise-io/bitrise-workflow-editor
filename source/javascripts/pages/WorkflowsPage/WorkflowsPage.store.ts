import { create } from 'zustand';

type State = {
  stepIndex: number;
  workflowId: string;
  isDialogOpen?:
    | 'chain-workflow'
    | 'create-workflow'
    | 'delete-workflow'
    | 'step-config-drawer'
    | 'step-selector-drawer';
};

type Action = {
  closeDialog: VoidFunction;
  openChainWorkflowDialog: VoidFunction;
  openCreateWorkflowDialog: VoidFunction;
  openDeleteWorkflowDialog: (workflowId: string) => void;
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
  openChainWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'chain-workflow' }));
  },
  openCreateWorkflowDialog: () => {
    return set(() => ({ isDialogOpen: 'create-workflow' }));
  },
  openDeleteWorkflowDialog: (workflowId: string) => {
    return set(() => ({ workflowId, isDialogOpen: 'delete-workflow' }));
  },
  openStepConfigDrawer: (workflowId: string, stepIndex: number) => {
    return set(() => ({ workflowId, stepIndex, isDialogOpen: 'step-config-drawer' }));
  },
  openStepSelectorDrawer: (workflowId: string, stepIndex: number) => {
    return set(() => ({ workflowId, stepIndex, isDialogOpen: 'step-selector-drawer' }));
  },
}));
