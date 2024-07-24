import { create } from 'zustand';

type State = {
  isDialogOpen?: 'create-workflow' | 'chain-workflow' | 'delete-workflow' | 'step-drawer';
};

type Action = {
  closeDialog: VoidFunction;
  openStepDrawer: VoidFunction;
  openChainWorkflowDialog: VoidFunction;
  openCreateWorkflowDialog: VoidFunction;
  openDeleteWorkflowDialog: VoidFunction;
};

export const useWorkflowsPageStore = create<State & Action>((set) => ({
  isDialogOpen: undefined,
  closeDialog: () => set(() => ({ isDialogOpen: undefined })),
  openStepDrawer: () => set(() => ({ isDialogOpen: 'step-drawer' })),
  openChainWorkflowDialog: () => set(() => ({ isDialogOpen: 'chain-workflow' })),
  openCreateWorkflowDialog: () => set(() => ({ isDialogOpen: 'create-workflow' })),
  openDeleteWorkflowDialog: () => set(() => ({ isDialogOpen: 'delete-workflow' })),
}));
