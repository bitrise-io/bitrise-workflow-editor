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
  selectedStepIndices: number[];
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
  selectedStepIndices?: number[];
  pipelineId?: string;
  stepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
};

type Action = {
  setPipelineId: (pipelineId?: string) => void;
  setWorkflowId: (workflowId?: string) => void;
  setStepBundleId: (stepBundleId?: string) => void;
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  isDialogOpen: (type: PipelinesPageDialogType) => boolean;
  isDialogMounted: (type: PipelinesPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const usePipelinesPageStore = create<State & Action>((set, get) => ({
  selectedStepIndices: [],
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
  setStepBundleId: (stepBundleId = '') => {
    return set(() => ({
      stepBundleId,
    }));
  },
  setSelectedStepIndices: (selectedStepIndices = []) => {
    return set(() => ({
      selectedStepIndices,
    }));
  },
  openDialog: ({
    type,
    pipelineId = '',
    stepBundleId = '',
    workflowId = '',
    parentWorkflowId = '',
    selectedStepIndices = [],
  }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== PipelinesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              selectedStepIndices,
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
          selectedStepIndices,
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

      if (get().selectedStepIndices.length === 1 && !_nextDialog) {
        return {
          selectedStepIndices: [],
          pipelineId: '',
          stepBundleId: '',
          workflowId: '',
          parentWorkflowId: '',
          nextDialog: undefined,
          openedDialogType: PipelinesPageDialogType.NONE,
          mountedDialogType: PipelinesPageDialogType.NONE,
        };
      }

      return {
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
