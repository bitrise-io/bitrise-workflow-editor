import { create } from 'zustand';

export enum PipelineConfigDialogType {
  NONE,
  START_BUILD,
  STEP_SELECTOR,
  PIPELINE_CONFIG,
  CREATE_PIPELINE,
  WORKFLOW_CONFIG,
  WORKFLOW_SELECTOR,
}

type State = {
  pipelineId: string;
  workflowId: string;
  stepIndex: number;
  openedDialogType: PipelineConfigDialogType;
  mountedDialogType: PipelineConfigDialogType;
};

type Action = {
  openDialog: (
    type: PipelineConfigDialogType,
    pipelineId?: string,
    workflowId?: string,
    stepIndex?: number,
  ) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
  setPipelineId: (pipelineId?: string) => void;
  setWorkflowId: (workflowId?: string) => void;
  isDialogOpen: (type: PipelineConfigDialogType) => boolean;
  isDialogMounted: (type: PipelineConfigDialogType) => boolean;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  pipelineId: '',
  workflowId: '',
  openedDialogType: PipelineConfigDialogType.NONE,
  mountedDialogType: PipelineConfigDialogType.NONE,
  openDialog: (type, pipelineId = '', workflowId = '', stepIndex = -1) => {
    return () => {
      return set(() => ({
        pipelineId,
        workflowId,
        stepIndex,
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
      pipelineId: '',
      workflowId: '',
      stepIndex: -1,
      openedDialogType: PipelineConfigDialogType.NONE,
      mountedDialogType: PipelineConfigDialogType.NONE,
    }));
  },
  setPipelineId: (pipelineId = '') => {
    return set(() => ({
      pipelineId,
    }));
  },
  setWorkflowId: (workflowId = '') => {
    return set(() => ({
      workflowId,
    }));
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
}));
