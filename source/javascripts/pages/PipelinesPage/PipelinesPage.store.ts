import { create } from 'zustand';

type State = {
  isDialogOpen?: 'create-pipeline';
};

type Action = {
  closeDialog: () => void;
  openCreatePipelineDialog: () => void;
};

export const usePipelinesPageStore = create<State & Action>((set) => ({
  isDialogOpen: undefined,
  closeDialog: () => {
    return set(() => ({
      isDialogOpen: undefined,
    }));
  },
  openCreatePipelineDialog: () => {
    return set(() => ({ isDialogOpen: 'create-pipeline' }));
  },
}));
