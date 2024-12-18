import { create } from 'zustand';

export enum PipelinesPageDialogType {
  NONE,
  START_BUILD,
  STEP_CONFIG,
  STEP_BUNDLE,
  STEP_SELECTOR,
  CHAIN_WORKFLOW,
  PIPELINE_CONFIG,
  CREATE_PIPELINE,
  WORKFLOW_CONFIG,
  WORKFLOW_SELECTOR,
}

type State = {
  stepIndex: number;
  pipelineId: string;
  stepBundleId: string;
  workflowId: string;
  parentWorkflowId: string;
  openedDialogType: PipelinesPageDialogType;
  mountedDialogType: PipelinesPageDialogType;
  _nextDialog?: Required<DialogParams>;
};

type DialogParams = {
  type: PipelinesPageDialogType;
  stepIndex?: number;
  pipelineId?: string;
  stepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
};

type Action = {
  setPipelineId: (pipelineId?: string) => void;
  setWorkflowId: (workflowId?: string) => void;
  setStepIndex: (stepIndex?: number) => void;
  isDialogOpen: (type: PipelinesPageDialogType) => boolean;
  isDialogMounted: (type: PipelinesPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  pipelineId: '',
  stepBundleId: '',
  workflowId: '',
  parentWorkflowId: '',
  openedDialogType: PipelinesPageDialogType.NONE,
  mountedDialogType: PipelinesPageDialogType.NONE,
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
  setStepIndex: (stepIndex = -1) => {
    return set(() => ({
      stepIndex,
    }));
  },
  openDialog: ({
    type,
    pipelineId = '',
    stepBundleId = '',
    workflowId = '',
    parentWorkflowId = '',
    stepIndex = -1,
  }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== PipelinesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              stepIndex,
              pipelineId,
              stepBundleId,
              workflowId,
              parentWorkflowId,
            },
          };
        }

        return {
          pipelineId,
          stepBundleId,
          workflowId,
          stepIndex,
          parentWorkflowId,
          _nextDialog: undefined,
          openedDialogType: type,
          mountedDialogType: type,
        };
      });
    };
  },
  closeDialog: () => {
    return set(() => ({
      openedDialogType: PipelinesPageDialogType.NONE,
    }));
  },
  unmountDialog: () => {
    return set(({ _nextDialog, openDialog }) => {
      if (_nextDialog) {
        requestAnimationFrame(() => openDialog(_nextDialog)());
      }

      return {
        stepIndex: -1,
        pipelineId: '',
        stepBundleId: '',
        workflowId: '',
        parentWorkflowId: '',
        nextDialog: undefined,
        openedDialogType: PipelinesPageDialogType.NONE,
        mountedDialogType: PipelinesPageDialogType.NONE,
      };
    });
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
}));
