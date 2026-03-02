import { create } from 'zustand';

import PageProps from '@/core/utils/PageProps';

type State = {
  _defaults: {
    stepQuery: string;
    stepBundleQuery: string;
    stepCategoryFilter: string[];
    stepMaintainerFilter: string[];
  };
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

const useSearch = create<State & Actions>((set, get) => ({
  _defaults: {
    stepQuery: '',
    stepBundleQuery: '',
    stepCategoryFilter: [],
    stepMaintainerFilter: [],
  },
  stepQuery: '',
  stepBundleQuery: '',
  stepCategoryFilter: [],
  stepMaintainerFilter: [],
  setSearchStep: (stepQuery: string) => set({ stepQuery }),
  setSearchStepBundle: (stepBundleQuery: string) => set({ stepBundleQuery }),
  setSearchStepCategories: (stepCategoryFilter: string[]) => set({ stepCategoryFilter }),
  setSearchStepMaintainers: (stepMaintainerFilter: string[]) => set({ stepMaintainerFilter }),
  reset: () => set(get()._defaults),
}));

export function initializeSearchDefaults() {
  useSearch.setState({
    _defaults: {
      stepQuery: '',
      stepBundleQuery: '',
      stepCategoryFilter: [],
      stepMaintainerFilter: PageProps.limits()?.allowNonBitriseSteps === false ? ['bitrise'] : [],
    },
    stepMaintainerFilter: PageProps.limits()?.allowNonBitriseSteps === false ? ['bitrise'] : [],
  });
}

export default useSearch;
