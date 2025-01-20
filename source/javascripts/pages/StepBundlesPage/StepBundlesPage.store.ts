import { create } from 'zustand';

export enum StepBundlesPageDialogType {
  NONE,
  STEP_CONFIG,
  STEP_SELECTOR,
  CREATE_STEP_BUNDLE,
  STEP_BUNDLE_CONFIG,
}

type DialogParams = {
  type: StepBundlesPageDialogType;
  stepIndex?: number;
};

type State = {
  stepIndex: number;
  selectedStepIndices: number[];
  openedDialogType: StepBundlesPageDialogType;
  mountedDialogType: StepBundlesPageDialogType;
  _nextDialog?: Required<DialogParams>;
};

type Action = {
  setStepIndex: (stepIndex?: number) => void;
  setSelectedStepIndices: (stepIndices?: number[]) => void;
  isDialogOpen: (type: StepBundlesPageDialogType) => boolean;
  isDialogMounted: (type: StepBundlesPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const useStepBundlesPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  selectedStepIndices: [],
  openedDialogType: StepBundlesPageDialogType.NONE,
  mountedDialogType: StepBundlesPageDialogType.NONE,
  setStepIndex: (stepIndex = -1) => {
    return set(() => ({
      stepIndex,
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
  openDialog: ({ type, stepIndex = -1 }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== StepBundlesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              stepIndex,
            },
          };
        }

        return {
          stepIndex,
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
          stepIndex: -1,
          selectedStepIndices: [],
          nextDialog: undefined,
          openedDialogType: StepBundlesPageDialogType.NONE,
          mountedDialogType: StepBundlesPageDialogType.NONE,
        };
      }

      return {
        stepIndex: -1,
        nextDialog: undefined,
        openedDialogType: StepBundlesPageDialogType.NONE,
        mountedDialogType: StepBundlesPageDialogType.NONE,
      };
    });
  },
}));
