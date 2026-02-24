import { create } from 'zustand';

import PageProps from '@/core/utils/PageProps';

type State = {
  stepQuery: string;
  stepBundleQuery: string;
  stepCategoryFilter: string[];
  stepMaintainerFilter: string[];
};

type Actions = {
  reset: () => void;
  setSearchStep: (searchStep: string) => void;
  setSearchStepBundle: (searchStepBundle: string) => void;
  setSearchStepCategories: (searchStepCategories: string[]) => void;
  setSearchStepMaintainers: (searchStepMaintainers: string[]) => void;
};

const InitialMaintainers = PageProps.limits()?.allowNonBitriseSteps === false ? ['bitrise'] : [];

const useSearch = create<State & Actions>((set) => ({
  stepQuery: '',
  stepBundleQuery: '',
  stepCategoryFilter: [],
  stepMaintainerFilter: InitialMaintainers,
  setSearchStep: (stepQuery: string) => set({ stepQuery }),
  setSearchStepBundle: (stepBundleQuery: string) => set({ stepBundleQuery }),
  setSearchStepCategories: (stepCategoryFilter: string[]) => set({ stepCategoryFilter }),
  setSearchStepMaintainers: (stepMaintainerFilter: string[]) => set({ stepMaintainerFilter }),
  reset: () =>
    set({
      stepQuery: '',
      stepBundleQuery: '',
      stepCategoryFilter: [],
      stepMaintainerFilter: InitialMaintainers,
    }),
}));

export default useSearch;
