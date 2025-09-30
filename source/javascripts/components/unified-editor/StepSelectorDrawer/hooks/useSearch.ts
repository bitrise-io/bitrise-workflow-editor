import { create } from 'zustand';

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

const useSearch = create<State & Actions>((set) => ({
  stepQuery: '',
  stepBundleQuery: '',
  stepCategoryFilter: [],
  stepMaintainerFilter: [],
  setSearchStep: (stepQuery: string) => set({ stepQuery }),
  setSearchStepBundle: (stepBundleQuery: string) => set({ stepBundleQuery }),
  setSearchStepCategories: (stepCategoryFilter: string[]) => set({ stepCategoryFilter }),
  setSearchStepMaintainers: (stepMaintainerFilter: string[]) => set({ stepMaintainerFilter }),
  reset: () =>
    set({
      stepQuery: '',
      stepBundleQuery: '',
      stepCategoryFilter: [],
      stepMaintainerFilter: [],
    }),
}));

export default useSearch;
