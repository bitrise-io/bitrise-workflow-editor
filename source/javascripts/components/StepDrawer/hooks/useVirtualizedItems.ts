import { RefObject, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Step, VirtualizedListItem } from '../StepDrawer.types';
import { RowSizes } from '../StepDrawer.constants';

type Props = {
  containerRef: RefObject<HTMLElement>;
  stepsByCategories: Record<string, Step[]>;
  columns: number;
  allowedStepIds?: Set<string>;
};

const useVirtualizedItems = ({ allowedStepIds, containerRef, stepsByCategories, columns }: Props) => {
  const { items, count } = useMemo(() => {
    let virtualItemCount = 0;
    const virtualItems = Object.entries(stepsByCategories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [category, steps]) => {
        const rows = Math.ceil(steps.length / columns);
        virtualItemCount += rows + 1;

        acc.push({ type: 'category', category, rows });
        for (let i = 0; i < rows; i++) {
          const stepsInRow = steps.slice(i * columns, (i + 1) * columns).map((step) => {
            const isDisabled = allowedStepIds && !allowedStepIds.has(step.id);
            return { ...step, isDisabled };
          });

          acc.push({
            type: 'steps',
            category,
            row: i,
            columns,
            steps: stepsInRow,
          });
        }
        return acc;
      }, [] as VirtualizedListItem[]);
    return { items: virtualItems, count: virtualItemCount };
  }, [allowedStepIds, columns, stepsByCategories]);

  const getItemKey = useCallback(
    (idx: number) => {
      const item = items[idx];
      return item.type === 'category' ? item.category : `${item.category}/row-${item.row}`;
    },
    [items],
  );

  const virtualizer = useVirtualizer({
    getScrollElement: () => containerRef.current,
    estimateSize: (idx) => RowSizes[items[idx].type],
    getItemKey,
    overscan: 3,
    count,
  });

  return { items, virtualizer };
};

export default useVirtualizedItems;
