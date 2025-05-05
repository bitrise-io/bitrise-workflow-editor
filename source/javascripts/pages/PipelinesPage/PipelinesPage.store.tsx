import { create } from 'zustand';

import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

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
  _nextDialog?: DialogParams;
  selectionParent?: SelectionParent;
};

type DialogParams = {
  type: PipelinesPageDialogType;
  selectedStepIndices?: number[];
  pipelineId?: string;
  stepBundleId?: string;
  newStepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
  selectionParent?: SelectionParent;
};

type Action = {
  setPipelineId: (pipelineId?: string) => void;
  setWorkflowId: (workflowId?: string) => void;
  setStepBundleId: (stepBundleId?: string) => void;
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  setSelectionParent: (selectionParent?: SelectionParent) => void;
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
  newStepBundleId: '',
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
  setSelectionParent: (selectionParent?: SelectionParent) => {
    return set(() => ({
      selectionParent,
    }));
  },
  openDialog: ({
    type,
    pipelineId = '',
    stepBundleId = '',
    newStepBundleId = '',
    workflowId = '',
    parentWorkflowId = '',
    selectedStepIndices,
    selectionParent,
  }) => {
    return () => {
      return set((state) => {
        const { openedDialogType, closeDialog } = state;
        if (openedDialogType !== PipelinesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
              pipelineId,
              stepBundleId,
              newStepBundleId,
              workflowId,
              parentWorkflowId,
              selectionParent: selectionParent || state.selectionParent,
            },
          };
        }

        return {
          pipelineId,
          stepBundleId,
          newStepBundleId,
          workflowId,
          selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
          parentWorkflowId,
          _nextDialog: undefined,
          openedDialogType: type,
          mountedDialogType: type,
          selectionParent: selectionParent || state.selectionParent,
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
    return set(({ _nextDialog, openDialog, selectedStepIndices }) => {
      if (_nextDialog) {
        requestAnimationFrame(() => openDialog(_nextDialog)());
      }

      if (selectedStepIndices.length === 1 && !_nextDialog) {
        return {
          selectedStepIndices: [],
          pipelineId: '',
          stepBundleId: '',
          newStepBundleId: '',
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
