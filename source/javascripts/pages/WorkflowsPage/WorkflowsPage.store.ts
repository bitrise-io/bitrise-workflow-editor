import { create } from 'zustand';

type State = {
  isDialogOpen?: 'create-workflow' | 'chain-workflow';
};

type Action = {
  closeDialog: VoidFunction;
  openChainWorkflowDialog: VoidFunction;
  openCreateWorkflowDialog: VoidFunction;
};

export const useWorkflowsPageStore = create<State & Action>((set) => ({
  isDialogOpen: undefined,
  closeDialog: () => set(() => ({ isDialogOpen: undefined })),
  openChainWorkflowDialog: () => set(() => ({ isDialogOpen: 'chain-workflow' })),
  openCreateWorkflowDialog: () => set(() => ({ isDialogOpen: 'create-workflow' })),
}));
