import capitalize from 'lodash/capitalize';
import { Step } from '@/core/models/Step';
import { CategoryRowItem, StepsRowItem, VirtualizedListItem } from './StepDrawer.types';

export const isCategoryRow = (item: VirtualizedListItem): item is CategoryRowItem => item.type === 'category';
export const isStepsRow = (item: VirtualizedListItem): item is StepsRowItem => item.type === 'steps';

export const displayCategoryName = (category: string) => capitalize(category).replace('-', ' ');

export const getStepsByCategories = (steps: Step[]) => {
  return steps.reduce(
    (acc, step) => {
      step?.mergedValues?.type_tags?.forEach((category) => {
        acc[category] ||= [];
        acc[category].push(step);
      });

      return acc;
    },
    {} as Record<string, Step[]>,
  );
};

export const formValueToArray = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
};

type CreateVirtualItemsGroupParams = {
  columns: number;
  category?: string;
  enabledStepIds?: Set<string>;
  steps: Step[];
};

export const createVirtualItemsGroup = ({
  columns,
  category,
  enabledStepIds,
  steps,
}: CreateVirtualItemsGroupParams) => {
  const items: VirtualizedListItem[] = [];

  if (steps.length > 0) {
    const rows = Math.ceil(steps.length / columns);
    if (category) {
      items.push({ type: 'category', category, rows });
    }

    for (let i = 0; i < rows; i++) {
      const stepsInRow = steps.slice(i * columns, (i + 1) * columns).map((step) => {
        const stepId = step?.resolvedInfo?.id || '';
        const isDisabled = Boolean(enabledStepIds && !enabledStepIds.has(stepId));
        return { id: stepId, step, isDisabled };
      });
      items.push({
        type: 'steps',
        category,
        row: i,
        columns,
        steps: stepsInRow,
      });
    }
  }

  return items;
};
