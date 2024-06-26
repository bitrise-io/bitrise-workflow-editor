import capitalize from 'lodash/capitalize';
import { AlgoliaStepResponse } from '../../models/Algolia';
import defaultIcon from '../../../images/step/icon-default.svg';
import { CategoryRowItem, Step, StepsRowItem, VirtualizedListItem } from './StepDrawer.types';

export const isCategoryRow = (item: VirtualizedListItem): item is CategoryRowItem => item.type === 'category';
export const isStepsRow = (item: VirtualizedListItem): item is StepsRowItem => item.type === 'steps';

export const displayCategoryName = (category: string) => capitalize(category).replace('-', ' ');

export const fromAlgolia = (response: AlgoliaStepResponse): Step => {
  return {
    id: response.id || '',
    cvs: response.cvs || '',
    icon:
      response.step?.asset_urls?.['icon.svg'] ||
      response.step?.asset_urls?.['icon.png'] ||
      response.info?.asset_urls?.['icon.svg'] ||
      response.info?.asset_urls?.['icon.png'] ||
      defaultIcon,
    title: response.step?.title || '',
    summary: response.step?.summary || '',
    description: response.step?.description || '',
    version: response.version || '',
    categories: response.step?.type_tags || [],
    isOfficial: response.info?.maintainer === 'bitrise' || false,
    isVerified: response.info?.maintainer === 'community' || false,
    isDeprecated: response.is_deprecated || false,
  };
};

export const getStepsByCategories = (steps: Step[]) => {
  return steps.reduce(
    (acc, step) => {
      step.categories.forEach((category) => {
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

export const createVirtualItemsCategory = (
  category: string,
  steps: Step[],
  columns: number,
  allowedStepIds: Set<string> | undefined = undefined,
) => {
  const items: VirtualizedListItem[] = [];

  if (steps.length > 0) {
    const rows = Math.ceil(steps.length / columns);
    items.push({ type: 'category', category, rows });

    for (let i = 0; i < rows; i++) {
      const stepsInRow = steps.slice(i * columns, (i + 1) * columns).map((step) => {
        const isDisabled = allowedStepIds && !allowedStepIds.has(step.id);
        return { ...step, isDisabled };
      });
      items.push({
        type: 'steps',
        category,
        row: i,
        steps: stepsInRow,
      });
    }
  }

  return items;
};
