import { create } from 'zustand';

import { markFloatingDrawerSwitch } from '@/components/unified-editor/FloatingDrawer/drawerSwitch';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

export type PipelineConfigTab = 'properties' | 'triggers';

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
  // Between one dialog closing and the one replacing it opening (a frame).
  isSwitchingDialog: boolean;
  pipelineConfigTab?: PipelineConfigTab;
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
  pipelineConfigTab?: PipelineConfigTab;
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
  isSwitchingDialog: false,
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
    pipelineConfigTab,
  }) => {
    return () => {
      return set((state) => {
        const { openedDialogType } = state;
        if (openedDialogType !== PipelinesPageDialogType.NONE) {
          // Replacing an open dialog: swap it in place on the next frame rather than sliding
          // this one out and the next one in.
          const next = {
            type,
            selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
            pipelineId,
            stepBundleId,
            newStepBundleId,
            workflowId,
            parentWorkflowId,
            selectionParent: selectionParent || state.selectionParent,
            pipelineConfigTab,
          };
          markFloatingDrawerSwitch();
          requestAnimationFrame(() => get().openDialog(next)());

          return {
            _nextDialog: undefined,
            openedDialogType: PipelinesPageDialogType.NONE,
            mountedDialogType: PipelinesPageDialogType.NONE,
            isSwitchingDialog: true,
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
          isSwitchingDialog: false,
          openedDialogType: type,
          mountedDialogType: type,
          selectionParent: selectionParent || state.selectionParent,
          pipelineConfigTab,
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
