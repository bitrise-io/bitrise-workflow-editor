import { create } from 'zustand';

export enum StepBundlesPageDialogType {
  NONE,
  CREATE_STEP_BUNDLE,
  STEP_CONFIG,
  STEP_SELECTOR,
}

type DialogParams = {
  type: StepBundlesPageDialogType;
  selectedStepIndices?: number[];
};

type State = {
  selectedStepIndices: number[];
  openedDialogType: StepBundlesPageDialogType;
  mountedDialogType: StepBundlesPageDialogType;
  _nextDialog?: Required<DialogParams>;
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
  openDialog: ({ type, selectedStepIndices = [] }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== StepBundlesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              selectedStepIndices,
            },
          };
        }

        return {
          selectedStepIndices,
          _nextDialog: undefined,
          openedDialogType: type,
          mountedDialogType: type,
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
    return set(({ _nextDialog, openDialog }) => {
      if (_nextDialog) {
        requestAnimationFrame(() => openDialog(_nextDialog)());
      }

      if (get().selectedStepIndices.length === 1 && !_nextDialog) {
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
