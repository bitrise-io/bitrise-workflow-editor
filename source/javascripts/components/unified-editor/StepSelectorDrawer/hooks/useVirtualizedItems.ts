import { RefObject, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Step } from '@/core/models/Step';
import { VirtualizedListItem } from '../StepSelectorDrawer.types';
import { RowSizes } from '../StepSelectorDrawer.constants';
import { createVirtualItemsGroup, getStepsByCategories } from '../StepSelectorDrawer.utils';
import { findScrollContainer } from '../components/AlgoliaStepList/AlgoliaStepList.utils';

type Props = {
  containerRef: RefObject<HTMLElement>;
  columns: number;
  hideCategoryNames: boolean;
  selectedCategories: string[];
  steps: Step[];
  enabledSteps?: Set<string>;
  highlightedStepGroups?: Record<string, Set<string>>;
};

const useVirtualizedItems = ({
  containerRef,
  columns,
  hideCategoryNames,
  selectedCategories,
  steps,
  enabledSteps,
  highlightedStepGroups,
}: Props) => {
  const items = useMemo(() => {
    const virtualItems: VirtualizedListItem[] = [];
    if (highlightedStepGroups && Object.keys(highlightedStepGroups).length > 0) {
      Object.entries(highlightedStepGroups).forEach(([category, stepIds]) => {
        const groupSteps = steps.filter((step) => stepIds.has(step?.id || ''));
        virtualItems.push(
          ...createVirtualItemsGroup({
            columns,
            category,
            enabledSteps,
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
          enabledSteps,
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
                enabledSteps,
                steps: categorySteps,
              }),
            );
          }

          return acc;
        }, virtualItems);
    }

    return virtualItems;
  }, [columns, enabledSteps, highlightedStepGroups, selectedCategories, hideCategoryNames, steps]);

  const getItemKey = useCallback(
    (idx: number) => {
      const item = items[idx];
      return item.type === 'category' ? item.category : `${item.category}/row-${item.row}`;
    },
    [items],
  );

  const virtualizer = useVirtualizer({
    getScrollElement: () => findScrollContainer(containerRef.current),
    estimateSize: (idx) => RowSizes[items[idx].type],
    getItemKey,
    overscan: 3,
    count: items.length,
  });

  return { items, virtualizer };
};

export default useVirtualizedItems;
