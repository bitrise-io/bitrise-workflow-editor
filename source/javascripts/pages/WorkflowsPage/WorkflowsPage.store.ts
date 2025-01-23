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

export type SelectionParent = {
  id: string;
  type: 'stepBundle' | 'workflow';
};

type State = {
  selectedStepIndices: number[];
  stepBundleId: string;
  workflowId: string;
  parentWorkflowId: string;
  openedDialogType: WorkflowsPageDialogType;
  mountedDialogType: WorkflowsPageDialogType;
  _nextDialog?: DialogParams;
  selectionParent?: SelectionParent;
};

type DialogParams = {
  type: WorkflowsPageDialogType;
  selectedStepIndices?: number[];
  stepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
  selectionParent?: SelectionParent;
};

type Action = {
  setWorkflowId: (workflowId?: string) => void;
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  setSelectionParent: (selectionParent?: SelectionParent) => void;
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
  selectionParent: undefined,
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
  setSelectionParent: (selectionParent?: SelectionParent) => {
    return set(() => ({
      selectionParent,
    }));
  },
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
  openDialog: ({
    type,
    workflowId = '',
    stepBundleId = '',
    parentWorkflowId = '',
    selectedStepIndices = [],
    selectionParent,
  }) => {
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
              selectionParent,
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
          selectionParent,
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
