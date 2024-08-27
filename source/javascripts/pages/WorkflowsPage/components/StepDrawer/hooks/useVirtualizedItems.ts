import { RefObject, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Step } from '@/core/models/Step';
import { VirtualizedListItem } from '../StepDrawer.types';
import { RowSizes } from '../StepDrawer.constants';
import { createVirtualItemsGroup, getStepsByCategories } from '../StepDrawer.utils';

type Props = {
  containerRef: RefObject<HTMLElement>;
  columns: number;
  hideCategoryNames: boolean;
  selectedCategories: string[];
  steps: Step[];
  enabledStepIds?: Set<string>;
  highlightedStepGroups?: Record<string, Set<string>>;
};

const useVirtualizedItems = ({
  containerRef,
  columns,
  hideCategoryNames,
  selectedCategories,
  steps,
  enabledStepIds,
  highlightedStepGroups,
}: Props) => {
  const items = useMemo(() => {
    const virtualItems: VirtualizedListItem[] = [];
    if (highlightedStepGroups && Object.keys(highlightedStepGroups).length > 0) {
      Object.entries(highlightedStepGroups).forEach(([category, stepIds]) => {
        const groupSteps = steps.filter((step) => stepIds.has(step?.resolvedInfo?.id || ''));
        virtualItems.push(
          ...createVirtualItemsGroup({
            columns,
            category,
            enabledStepIds,
            steps: groupSteps,
          }),
        );
      });
    }

    if (hideCategoryNames) {
      virtualItems.push(
        ...createVirtualItemsGroup({
          columns,
          category: 'Matching steps',
          enabledStepIds,
          steps,
        }),
      );
    } else {
      Object.entries(getStepsByCategories(steps))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reduce((acc, [category, categorySteps]) => {
          if (selectedCategories?.length === 0 || selectedCategories?.includes(category)) {
            acc.push(
              ...createVirtualItemsGroup({
                columns,
                category,
                enabledStepIds,
                steps: categorySteps,
              }),
            );
          }

          return acc;
        }, virtualItems);
    }

    return virtualItems;
  }, [columns, enabledStepIds, highlightedStepGroups, selectedCategories, hideCategoryNames, steps]);

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
