import { create } from 'zustand';

export enum WorkflowsPageDialogType {
  NONE,
  WITH_GROUP,
  STEP_BUNDLE,
  START_BUILD,
  STEP_CONFIG,
  STEP_SELECTOR,
  CHAIN_WORKFLOW,
  CREATE_WORKFLOW,
  WORKFLOW_CONFIG,
}

type State = {
  selectedStepIndices: number[];
  stepBundleId: string;
  workflowId: string;
  parentWorkflowId: string;
  openedDialogType: WorkflowsPageDialogType;
  mountedDialogType: WorkflowsPageDialogType;
  _nextDialog?: Required<DialogParams>;
};

type DialogParams = {
  type: WorkflowsPageDialogType;
  selectedStepIndices?: number[];
  stepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
};

type Action = {
  setWorkflowId: (workflowId?: string) => void;
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  isDialogOpen: (type: WorkflowsPageDialogType) => boolean;
  isDialogMounted: (type: WorkflowsPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const useWorkflowsPageStore = create<State & Action>((set, get) => ({
  selectedStepIndices: [],
  stepBundleId: '',
  workflowId: '',
  parentWorkflowId: '',
  openedDialogType: WorkflowsPageDialogType.NONE,
  mountedDialogType: WorkflowsPageDialogType.NONE,
  setWorkflowId: (workflowId = '') => {
    return set(() => ({
      workflowId,
    }));
  },
  setSelectedStepIndices: (selectedStepIndices = []) => {
    return set(() => ({
      selectedStepIndices,
    }));
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
  openDialog: ({ type, workflowId = '', stepBundleId = '', parentWorkflowId = '', selectedStepIndices = [] }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== WorkflowsPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              selectedStepIndices,
              stepBundleId,
              workflowId,
              parentWorkflowId,
            },
          };
        }

        return {
          selectedStepIndices,
          stepBundleId,
          workflowId,
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
      openedDialogType: WorkflowsPageDialogType.NONE,
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
          stepBundleId: '',
          workflowId: '',
          parentWorkflowId: '',
          nextDialog: undefined,
          openedDialogType: WorkflowsPageDialogType.NONE,
          mountedDialogType: WorkflowsPageDialogType.NONE,
        };
      }

      return {
        nextDialog: undefined,
        openedDialogType: WorkflowsPageDialogType.NONE,
        mountedDialogType: WorkflowsPageDialogType.NONE,
      };
    });
  },
}));
