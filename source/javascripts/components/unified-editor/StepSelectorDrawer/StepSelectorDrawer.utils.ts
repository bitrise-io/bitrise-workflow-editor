import capitalize from 'lodash/capitalize';
import { Step } from '@/core/models/Step';
import { StepApiResult } from '@/core/api/StepApi';
import { CategoryRowItem, StepsRowItem, VirtualizedListItem } from './StepSelectorDrawer.types';

export const isCategoryRow = (item: VirtualizedListItem): item is CategoryRowItem => item.type === 'category';
export const isStepsRow = (item: VirtualizedListItem): item is StepsRowItem => item.type === 'steps';

export const displayCategoryName = (category: string) => capitalize(category).replace('-', ' ');

export const getStepsByCategories = (steps: Step[]) => {
  return steps.reduce(
    (acc, step) => {
      step?.defaultValues?.type_tags?.forEach((category) => {
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
  enabledSteps?: Set<string>;
  steps: Step[];
};

export const createVirtualItemsGroup = ({ columns, category, enabledSteps, steps }: CreateVirtualItemsGroupParams) => {
  const items: VirtualizedListItem[] = [];

  if (steps.length > 0) {
    const rows = Math.ceil(steps.length / columns);
    if (category) {
      items.push({ type: 'category', category, rows });
    }

    for (let i = 0; i < rows; i++) {
      const stepsInRow = steps.slice(i * columns, (i + 1) * columns).map((step) => {
        const stepId = step?.id || '';
        const isDisabled = Boolean(enabledSteps && !enabledSteps.has(stepId));
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

export function compareStepPriority(a: StepApiResult, b: StepApiResult): number {
  const aInfo = a?.resolvedInfo;
  const bInfo = b?.resolvedInfo;

  if (aInfo?.isOfficial === bInfo?.isOfficial) {
    return 0;
  }

  if (aInfo?.isOfficial && !bInfo?.isOfficial) {
    return -1;
  }

  if (bInfo?.isOfficial && !aInfo?.isOfficial) {
    return 1;
  }

  if (aInfo?.isVerified === bInfo?.isVerified) {
    return 0;
  }

  if (aInfo?.isVerified && !bInfo?.isVerified) {
    return -1;
  }

  if (bInfo?.isVerified && bInfo?.isVerified) {
    return 1;
  }

  if (aInfo?.isCommunity === bInfo?.isCommunity) {
    return 0;
  }

  if (aInfo?.isCommunity && !bInfo?.isCommunity) {
    return -1;
  }

  if (bInfo?.isCommunity && !aInfo?.isCommunity) {
    return 1;
  }

  return 0;
}

export function compareByPriority(a: StepApiResult, b: StepApiResult): number {
  const aInfo = a?.resolvedInfo;
  const bInfo = b?.resolvedInfo;
  // Prioritize official steps first
  if (Boolean(aInfo?.isOfficial) !== Boolean(bInfo?.isOfficial)) {
    return aInfo?.isOfficial ? -1 : 1;
  }

  // Prioritize verified steps second
  if (Boolean(aInfo?.isVerified) !== Boolean(bInfo?.isVerified)) {
    return aInfo?.isVerified ? -1 : 1;
  }

  // Prioritize community steps third
  if (Boolean(aInfo?.isCommunity) !== Boolean(bInfo?.isCommunity)) {
    return aInfo?.isCommunity ? -1 : 1;
  }

  // If none of the above conditions are met, they are considered equal in priority
  return 0;
}
