import { create } from 'zustand';

type State = {
  searchStep: string;
  searchStepBundle: string;
  searchStepCategories: string[];
};

type Actions = {
  reset: () => void;
  setSearchStep: (searchStep: string) => void;
  setSearchStepBundle: (searchStepBundle: string) => void;
  setSearchStepCategories: (searchStepCategories: string[]) => void;
};

const useSearch = create<State & Actions>((set) => ({
  searchStep: '',
  searchStepBundle: '',
  searchStepCategories: [],
  setSearchStep: (searchStep: string) => set({ searchStep }),
  setSearchStepBundle: (searchStepBundle: string) => set({ searchStepBundle }),
  setSearchStepCategories: (searchStepCategories: string[]) => set({ searchStepCategories }),
  reset: () => set({ searchStep: '', searchStepBundle: '', searchStepCategories: [] }),
}));

export default useSearch;
