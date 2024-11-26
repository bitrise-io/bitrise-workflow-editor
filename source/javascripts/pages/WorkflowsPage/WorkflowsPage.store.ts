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
  workflowId: string;
  stepIndex: number;
  openedDialogType: WorkflowsPageDialogType;
  mountedDialogType: WorkflowsPageDialogType;
  nextDialog?: {
    type: WorkflowsPageDialogType;
    workflowId: string;
    stepIndex: number;
  };
};

type Action = {
  openDialog: (type: WorkflowsPageDialogType, workflowId?: string, stepIndex?: number) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
  setWorkflowId: (workflowId?: string) => void;
  isDialogOpen: (type: WorkflowsPageDialogType) => boolean;
  isDialogMounted: (type: WorkflowsPageDialogType) => boolean;
};

export const useWorkflowsPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  workflowId: '',
  openedDialogType: WorkflowsPageDialogType.NONE,
  mountedDialogType: WorkflowsPageDialogType.NONE,
  openDialog: (type, workflowId = '', stepIndex = -1) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== WorkflowsPageDialogType.NONE) {
          closeDialog();
          return { nextDialog: { type, workflowId, stepIndex } };
        }

        return {
          workflowId,
          stepIndex,
          nextDialog: undefined,
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
    return set(({ nextDialog, openDialog }) => {
      if (nextDialog) {
        requestAnimationFrame(() => {
          openDialog(nextDialog.type, nextDialog.workflowId, nextDialog.stepIndex)();
        });
      }

      return {
        workflowId: '',
        stepIndex: -1,
        nextDialog: undefined,
        openedDialogType: WorkflowsPageDialogType.NONE,
        mountedDialogType: WorkflowsPageDialogType.NONE,
      };
    });
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
