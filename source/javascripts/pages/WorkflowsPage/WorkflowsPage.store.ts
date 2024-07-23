import { create } from 'zustand';

type State = {
  isDialogOpen?: 'create-workflow' | 'chain-workflow' | 'delete-workflow';
};

type Action = {
  closeDialog: VoidFunction;
  openChainWorkflowDialog: VoidFunction;
  openCreateWorkflowDialog: VoidFunction;
  openDeleteWorkflowDialog: VoidFunction;
};

export const useWorkflowsPageStore = create<State & Action>((set) => ({
  isDialogOpen: undefined,
  closeDialog: () => set(() => ({ isDialogOpen: undefined })),
  openChainWorkflowDialog: () => set(() => ({ isDialogOpen: 'chain-workflow' })),
  openCreateWorkflowDialog: () => set(() => ({ isDialogOpen: 'create-workflow' })),
  openDeleteWorkflowDialog: () => set(() => ({ isDialogOpen: 'delete-workflow' })),
}));
