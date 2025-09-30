import { capitalize, startCase } from 'es-toolkit';

import { AlgoliaStepResponse } from '@/core/api/AlgoliaApi';

import useDebouncedFilter from './useDebouncedFilter';

type Props = {
  steps: AlgoliaStepResponse[];
  enabledSteps?: Set<string>;
  columns: number;
};

function groupSteps(steps: AlgoliaStepResponse[], search: string, categories: string[], enabledSteps?: Set<string>) {
  const copy = [...steps];
  const categoryMap = new Map<string, AlgoliaStepResponse[]>();

  if (enabledSteps) {
    const allowedSteps = copy.filter((step) => enabledSteps.has(step.id));
    if (allowedSteps.length) {
      categoryMap.set('Allowed Steps', allowedSteps);
    }
  }

  if (search) {
    categoryMap.set(`Matching Steps for "${search}"`, copy);
    return categoryMap;
  }

  copy.forEach((step) => {
    step.step.type_tags?.forEach((category) => {
      if (categories.length && !categories.includes(category)) {
        return;
      }

      const normalizedCategory = capitalize(startCase(category));
      categoryMap.set(normalizedCategory, [...(categoryMap.get(normalizedCategory) ?? []), step]);
    });
  });

  return categoryMap;
}

const useVirtualItems = ({ steps, enabledSteps, columns = 1 }: Props) => {
  const { search, categories } = useDebouncedFilter();

  // Ensure columns is a valid positive integer
  const safeColumns = typeof columns === 'number' && columns > 0 ? columns : 1;
  const safeMaxColumns = Math.min(safeColumns, 4); // Limit to a maximum of 4 columns

  const result: Array<string | AlgoliaStepResponse[]> = [];
  const groupedSteps = groupSteps(steps, search, categories, enabledSteps);

  groupedSteps.forEach((stepsOfGroup, groupTitle) => {
    result.push(groupTitle);
    while (stepsOfGroup.length) {
      result.push([...stepsOfGroup.splice(0, safeMaxColumns)]);
    }
  });

  return result;
};

export default useVirtualItems;
