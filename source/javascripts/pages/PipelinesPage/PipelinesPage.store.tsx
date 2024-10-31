import { create } from 'zustand';

export enum PipelineConfigDialogType {
  NONE,
  PIPELINE_CONFIG,
  CREATE_PIPELINE,
  DELETE_PIPELINE,
}

type State = {
  pipelineId: string;
  openedDialogType: PipelineConfigDialogType;
  mountedDialogType: PipelineConfigDialogType;
};

type Action = {
  openDialog: (type: PipelineConfigDialogType, pipelineId?: string) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
  setPipelineId: (pipelineId?: string) => void;
  isDialogOpen: (type: PipelineConfigDialogType) => boolean;
  isDialogMounted: (type: PipelineConfigDialogType) => boolean;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  pipelineId: '',
  openedDialogType: PipelineConfigDialogType.NONE,
  mountedDialogType: PipelineConfigDialogType.NONE,
  openDialog: (type, pipelineId = '') => {
    return () => {
      return set(() => ({
        pipelineId,
        openedDialogType: type,
        mountedDialogType: type,
      }));
    };
  },
  closeDialog: () => {
    return set(() => ({
      openedDialogType: PipelineConfigDialogType.NONE,
    }));
  },
  unmountDialog: () => {
    return set(() => ({
      openedDialogType: PipelineConfigDialogType.NONE,
      mountedDialogType: PipelineConfigDialogType.NONE,
    }));
  },
  setPipelineId: (pipelineId = '') => {
    return set(() => ({
      pipelineId,
    }));
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
}));
