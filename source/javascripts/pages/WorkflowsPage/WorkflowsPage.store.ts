import { create } from 'zustand';

import { markFloatingDrawerSwitch } from '@/components/unified-editor/FloatingDrawer/drawerSwitch';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

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
  parentStepBundleId: string;
  workflowId: string;
  parentWorkflowId: string;
  openedDialogType: WorkflowsPageDialogType;
  mountedDialogType: WorkflowsPageDialogType;
  _nextDialog?: DialogParams;
  // Between one dialog closing and the one replacing it opening (a frame).
  isSwitchingDialog: boolean;
  selectionParent?: SelectionParent;
};

type DialogParams = {
  type: WorkflowsPageDialogType;
  selectedStepIndices?: number[];
  stepBundleId?: string;
  newStepBundleId?: string;
  parentStepBundleId?: string;
  workflowId?: string;
  parentWorkflowId?: string;
  selectionParent?: SelectionParent;
};

type Action = {
  setWorkflowId: (workflowId?: string) => void;
  setStepBundleId: (stepBundleId?: string) => void;
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
  newStepBundleId: '',
  parentStepBundleId: '',
  workflowId: '',
  parentWorkflowId: '',
  isSwitchingDialog: false,
  openedDialogType: WorkflowsPageDialogType.NONE,
  mountedDialogType: WorkflowsPageDialogType.NONE,
  selectionParent: undefined,
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
  isDialogOpen: (type) => {
    return get().openedDialogType === type;
  },
  isDialogMounted: (type) => {
    return get().mountedDialogType === type;
  },
  openDialog: ({
    type,
    stepBundleId = '',
    newStepBundleId = '',
    parentStepBundleId = '',
    workflowId = '',
    parentWorkflowId = '',
    selectedStepIndices,
    selectionParent,
  }) => {
    return () => {
      return set((state) => {
        const {
          openedDialogType,
          selectionParent: stateSelectionParent,
          selectedStepIndices: stateSelectedStepIndices,
        } = state;
        if (openedDialogType !== WorkflowsPageDialogType.NONE) {
          // Replacing an open dialog: swap it in place on the next frame rather than sliding
          // this one out and the next one in.
          const next = {
            type,
            selectedStepIndices: selectedStepIndices || stateSelectedStepIndices,
            stepBundleId,
            newStepBundleId,
            parentStepBundleId,
            workflowId,
            parentWorkflowId,
            selectionParent: selectionParent || stateSelectionParent,
          };
          markFloatingDrawerSwitch();
          requestAnimationFrame(() => get().openDialog(next)());

          return {
            _nextDialog: undefined,
            openedDialogType: WorkflowsPageDialogType.NONE,
            mountedDialogType: WorkflowsPageDialogType.NONE,
            isSwitchingDialog: true,
          };
        }

        return {
          selectedStepIndices: selectedStepIndices || stateSelectedStepIndices,
          stepBundleId,
          newStepBundleId,
          parentStepBundleId,
          workflowId,
          parentWorkflowId,
          _nextDialog: undefined,
          isSwitchingDialog: false,
          openedDialogType: type,
          mountedDialogType: type,
          selectionParent: selectionParent || stateSelectionParent,
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
    return set(({ _nextDialog, openDialog, selectedStepIndices }) => {
      if (_nextDialog) {
        requestAnimationFrame(() => openDialog(_nextDialog)());
      }

      if (selectedStepIndices.length === 1 && !_nextDialog) {
        return {
          selectedStepIndices: [],
          stepBundleId: '',
          newStepBundleId: '',
          parentStepBundleId: '',
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
