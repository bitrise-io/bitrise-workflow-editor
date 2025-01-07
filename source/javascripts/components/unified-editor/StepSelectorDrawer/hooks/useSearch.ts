import { create } from 'zustand';

type State = {
  stepQuery: string;
  stepBundleQuery: string;
  stepCategoryFilter: string[];
};

type Actions = {
  reset: () => void;
  setSearchStep: (searchStep: string) => void;
  setSearchStepBundle: (searchStepBundle: string) => void;
  setSearchStepCategories: (searchStepCategories: string[]) => void;
};

const useSearch = create<State & Actions>((set) => ({
  stepQuery: '',
  stepBundleQuery: '',
  stepCategoryFilter: [],
  setSearchStep: (stepQuery: string) => set({ stepQuery }),
  setSearchStepBundle: (stepBundleQuery: string) => set({ stepBundleQuery }),
  setSearchStepCategories: (stepCategoryFilter: string[]) => set({ stepCategoryFilter }),
  reset: () => set({ stepQuery: '', stepBundleQuery: '', stepCategoryFilter: [] }),
}));

export default useSearch;
