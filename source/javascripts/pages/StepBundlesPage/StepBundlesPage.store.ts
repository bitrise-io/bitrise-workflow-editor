import { create } from 'zustand';

import { markFloatingDrawerSwitch } from '@/components/unified-editor/FloatingDrawer/drawerSwitch';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

export enum StepBundlesPageDialogType {
  NONE,
  CREATE_STEP_BUNDLE,
  STEP_BUNDLE,
  STEP_CONFIG,
  STEP_SELECTOR,
  // The page's own Step bundle (its definition), as opposed to STEP_BUNDLE, a bundle used inside it.
  STEP_BUNDLE_DEFINITION,
}

type DialogParams = {
  type: StepBundlesPageDialogType;
  selectedStepIndices?: number[];
  stepBundleId?: string;
  newStepBundleId?: string;
  selectionParent?: SelectionParent;
};

type State = {
  selectedStepIndices: number[];
  openedDialogType: StepBundlesPageDialogType;
  mountedDialogType: StepBundlesPageDialogType;
  _nextDialog?: DialogParams;
  // Between one dialog closing and the one replacing it opening (a frame).
  isSwitchingDialog: boolean;
  stepBundleId: string;
  selectionParent?: SelectionParent;
};

type Action = {
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  isDialogOpen: (type: StepBundlesPageDialogType) => boolean;
  isDialogMounted: (type: StepBundlesPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const useStepBundlesPageStore = create<State & Action>((set, get) => ({
  selectedStepIndices: [],
  stepBundleId: '',
  newStepBundleId: '',
  isSwitchingDialog: false,
  openedDialogType: StepBundlesPageDialogType.NONE,
  mountedDialogType: StepBundlesPageDialogType.NONE,
  selectionParent: undefined,
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
  openDialog: ({ type, selectedStepIndices, stepBundleId, newStepBundleId, selectionParent }) => {
    return () => {
      return set((state) => {
        const { openedDialogType, selectionParent: stateSelectionParent } = state;
        if (openedDialogType !== StepBundlesPageDialogType.NONE) {
          // Replacing an open dialog: swap it in place on the next frame rather than sliding
          // this one out and the next one in.
          const next = {
            type,
            selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
            stepBundleId,
            newStepBundleId,
            selectionParent: selectionParent || stateSelectionParent,
          };
          markFloatingDrawerSwitch();
          requestAnimationFrame(() => get().openDialog(next)());

          return {
            _nextDialog: undefined,
            openedDialogType: StepBundlesPageDialogType.NONE,
            mountedDialogType: StepBundlesPageDialogType.NONE,
            isSwitchingDialog: true,
          };
        }

        return {
          selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
          _nextDialog: undefined,
          isSwitchingDialog: false,
          openedDialogType: type,
          mountedDialogType: type,
          stepBundleId,
          newStepBundleId,
          selectionParent: selectionParent || stateSelectionParent,
        };
      });
    };
  },
  closeDialog: () => {
    return set(() => ({
      openedDialogType: StepBundlesPageDialogType.NONE,
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
          nextDialog: undefined,
          openedDialogType: StepBundlesPageDialogType.NONE,
          mountedDialogType: StepBundlesPageDialogType.NONE,
        };
      }

      return {
        nextDialog: undefined,
        openedDialogType: StepBundlesPageDialogType.NONE,
        mountedDialogType: StepBundlesPageDialogType.NONE,
      };
    });
  },
}));
