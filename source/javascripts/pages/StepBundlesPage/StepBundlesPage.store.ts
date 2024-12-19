import { create } from 'zustand';

export enum StepBundlesPageDialogType {
  NONE,
  STEP_BUNDLE,
  STEP_CONFIG,
  STEP_SELECTOR,
  CREATE_STEP_BUNDLE,
}

type DialogParams = {
  type: StepBundlesPageDialogType;
  stepIndex?: number;
  stepBundleId?: string;
};

type State = {
  stepIndex: number;
  stepBundleId: string;
  openedDialogType: StepBundlesPageDialogType;
  mountedDialogType: StepBundlesPageDialogType;
  _nextDialog?: Required<DialogParams>;
};

type Action = {
  setStepBundleId: (stepBundleId?: string) => void;
  setStepIndex: (stepIndex?: number) => void;
  isDialogOpen: (type: StepBundlesPageDialogType) => boolean;
  isDialogMounted: (type: StepBundlesPageDialogType) => boolean;
  openDialog: (params: DialogParams) => () => void;
  closeDialog: () => void;
  unmountDialog: () => void;
};

export const useStepBundlesPageStore = create<State & Action>((set, get) => ({
  stepIndex: -1,
  stepBundleId: '',
  openedDialogType: StepBundlesPageDialogType.NONE,
  mountedDialogType: StepBundlesPageDialogType.NONE,
  setStepBundleId: (stepBundleId = '') => {
    return set(() => ({
      stepBundleId,
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
  openDialog: ({ type, stepBundleId = '', stepIndex = -1 }) => {
    return () => {
      return set(({ openedDialogType, closeDialog }) => {
        if (openedDialogType !== StepBundlesPageDialogType.NONE) {
          closeDialog();

          return {
            _nextDialog: {
              type,
              stepIndex,
              stepBundleId,
            },
          };
        }

        return {
          stepIndex,
          stepBundleId,
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

      return {
        stepIndex: -1,
        stepBundleId: '',
        nextDialog: undefined,
        openedDialogType: StepBundlesPageDialogType.NONE,
        mountedDialogType: StepBundlesPageDialogType.NONE,
      };
    });
  },
}));
