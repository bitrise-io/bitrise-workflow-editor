import { create } from 'zustand';

export enum PipelinesPageDialogType {
  NONE,
  START_BUILD,
  STEP_CONFIG,
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
  openedDialogType: PipelinesPageDialogType;
  mountedDialogType: PipelinesPageDialogType;
};

type Action = {
  openDialog: (
    type: PipelinesPageDialogType,
    pipelineId?: string,
    workflowId?: string,
    stepIndex?: number,
  ) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
  setPipelineId: (pipelineId?: string) => void;
  setWorkflowId: (workflowId?: string) => void;
  isDialogOpen: (type: PipelinesPageDialogType) => boolean;
  isDialogMounted: (type: PipelinesPageDialogType) => boolean;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  pipelineId: '',
  workflowId: '',
  openedDialogType: PipelinesPageDialogType.NONE,
  mountedDialogType: PipelinesPageDialogType.NONE,
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
      openedDialogType: PipelinesPageDialogType.NONE,
    }));
  },
  unmountDialog: () => {
    return set(() => ({
      pipelineId: '',
      workflowId: '',
      stepIndex: -1,
      openedDialogType: PipelinesPageDialogType.NONE,
      mountedDialogType: PipelinesPageDialogType.NONE,
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
