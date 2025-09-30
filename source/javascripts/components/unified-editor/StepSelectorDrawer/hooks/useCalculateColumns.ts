import { RefObject } from 'react';
import { useResizeObserver } from 'usehooks-ts';
import { create } from 'zustand';

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

  useResizeObserver({ ref, onResize: ({ width }) => setColumns(Math.ceil((width ?? 600) / 600)) });

  return useCalculateColumnsStore((state) => state.columns);
};

export default useCalculateColumns;
