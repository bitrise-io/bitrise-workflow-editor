import { create } from 'zustand';

export enum PipelineConfigDialogType {
  NONE,
  PIPELINE_CONFIG,
  CREATE_PIPELINE,
  WORKFLOW_SELECTOR,
  WORKFLOW_CONFIG,
}

type State = {
  pipelineId: string;
  workflowId: string;
  openedDialogType: PipelineConfigDialogType;
  mountedDialogType: PipelineConfigDialogType;
};

type Action = {
  openDialog: (type: PipelineConfigDialogType, pipelineId?: string, workflowId?: string) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
  setPipelineId: (pipelineId?: string) => void;
  isDialogOpen: (type: PipelineConfigDialogType) => boolean;
  isDialogMounted: (type: PipelineConfigDialogType) => boolean;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  pipelineId: '',
  workflowId: '',
  openedDialogType: PipelineConfigDialogType.NONE,
  mountedDialogType: PipelineConfigDialogType.NONE,
  openDialog: (type, pipelineId = '', workflowId = '') => {
    return () => {
      return set(() => ({
        pipelineId,
        workflowId,
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
    console.log('isDialogOpen', get().openedDialogType, type);
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    console.log('isDialogOpen', get().openedDialogType, type);
    return get().mountedDialogType === type;
  },
}));
