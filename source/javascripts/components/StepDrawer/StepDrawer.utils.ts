import capitalize from 'lodash/capitalize';
import { AlgoliaStepResponse, Maintainer } from '../../models/Algolia';
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
    isOfficial: response.info?.maintainer === Maintainer.Bitrise || false,
    isVerified: response.info?.maintainer === Maintainer.Verified || false,
    isCommunity: response.info?.maintainer === Maintainer.Community || false,
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
        const isDisabled = enabledStepIds && !enabledStepIds.has(step.id);
        return { ...step, isDisabled };
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
