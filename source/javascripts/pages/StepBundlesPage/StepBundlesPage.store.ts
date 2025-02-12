import { create } from 'zustand';

export enum StepBundlesPageDialogType {
  NONE,
  CREATE_STEP_BUNDLE,
  STEP_BUNDLE,
  STEP_CONFIG,
  STEP_SELECTOR,
}

type DialogParams = {
  type: StepBundlesPageDialogType;
  selectedStepIndices?: number[];
  stepBundleId?: string;
  newStepBundleId?: string;
};

type State = {
  selectedStepIndices: number[];
  openedDialogType: StepBundlesPageDialogType;
  mountedDialogType: StepBundlesPageDialogType;
  _nextDialog?: DialogParams;
  stepBundleId?: string;
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
  openedDialogType: StepBundlesPageDialogType.NONE,
  mountedDialogType: StepBundlesPageDialogType.NONE,
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
  openDialog: ({ type, selectedStepIndices, stepBundleId, newStepBundleId }) => {
    return () => {
      return set((state) => {
        const { openedDialogType, closeDialog } = state;
        if (openedDialogType !== StepBundlesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
              stepBundleId,
              newStepBundleId,
            },
          };
        }

        return {
          selectedStepIndices: selectedStepIndices || state.selectedStepIndices,
          _nextDialog: undefined,
          openedDialogType: type,
          mountedDialogType: type,
          stepBundleId,
          newStepBundleId,
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
