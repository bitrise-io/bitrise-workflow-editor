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
  stepIndex: number;
  stepBundleId: string;
  workflowId: string;
  parentWorkflowId: string;
  openedDialogType: WorkflowsPageDialogType;
  mountedDialogType: WorkflowsPageDialogType;
  _nextDialog?: Required<DialogParams>;
};

type DialogParams = {
  type: WorkflowsPageDialogType;
  stepIndex?: number;
  stepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
};

type Action = {
  setWorkflowId: (workflowId?: string) => void;
  setStepIndex: (stepIndex?: number) => void;
  isDialogOpen: (type: WorkflowsPageDialogType) => boolean;
  isDialogMounted: (type: WorkflowsPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const useWorkflowsPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
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
  setStepIndex: (stepIndex = -1) => {
    return set(() => ({
      stepIndex,
    }));
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
  openDialog: ({ type, workflowId = '', stepBundleId = '', parentWorkflowId = '', stepIndex = -1 }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== WorkflowsPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              stepIndex,
              stepBundleId,
              workflowId,
              parentWorkflowId,
            },
          };
        }

        return {
          stepIndex,
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

      return {
        stepIndex: -1,
        workflowId: '',
        parentWorkflowId: '',
        nextDialog: undefined,
        openedDialogType: WorkflowsPageDialogType.NONE,
        mountedDialogType: WorkflowsPageDialogType.NONE,
      };
    });
  },
}));
