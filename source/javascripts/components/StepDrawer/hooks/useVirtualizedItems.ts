import { RefObject, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Step, VirtualizedListItem } from '../StepDrawer.types';
import { RowSizes } from '../StepDrawer.constants';
import { createVirtualItemsCategory, getStepsByCategories } from '../StepDrawer.utils';

type Props = {
  containerRef: RefObject<HTMLElement>;
  steps: Step[];
  columns: number;
  allowedStepIds?: Set<string>;
};

const useVirtualizedItems = ({ allowedStepIds, containerRef, steps, columns }: Props) => {
  const items = useMemo(() => {
    const virtualItems: VirtualizedListItem[] = [];
    if (allowedStepIds) {
      const allowedSteps = steps.filter((step) => allowedStepIds.has(step.id));
      virtualItems.push(...createVirtualItemsCategory('Allowed steps', allowedSteps, columns, allowedStepIds));
    }

    Object.entries(getStepsByCategories(steps))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [category, categorySteps]) => {
        acc.push(...createVirtualItemsCategory(category, categorySteps, columns, allowedStepIds));
        return acc;
      }, virtualItems);

    return virtualItems;
  }, [allowedStepIds, steps, columns]);

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
    count: items.length,
  });

  return { items, virtualizer };
};

export default useVirtualizedItems;
