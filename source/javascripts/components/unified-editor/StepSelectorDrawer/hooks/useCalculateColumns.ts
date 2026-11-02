import { RefObject } from 'react';
import { useResizeObserver } from 'usehooks-ts';
import { create } from 'zustand';

import { GAP, MIN_STEP_WIDTH } from '../components/AlgoliaStepList.const';

type State = {
  columns: number;
  setColumns: (columns: number) => void;
};

const useCalculateColumnsStore = create<State>((set) => ({
  columns: 1,
  setColumns: (columns: number) => set({ columns }),
}));

const useCalculateColumns = (ref: RefObject<HTMLElement>) => {
  const setColumns = useCalculateColumnsStore((state) => state.setColumns);

  // As many columns as fit with each Step at least MIN_STEP_WIDTH wide: two in the drawer on most screens.
  useResizeObserver({
    ref,
    onResize: ({ width }) => setColumns(Math.max(1, Math.floor(((width ?? 0) + GAP) / (MIN_STEP_WIDTH + GAP)))),
  });

  return useCalculateColumnsStore((state) => state.columns);
};

export default useCalculateColumns;
