import capitalize from 'lodash/capitalize';
import { Step } from './StepDrawer.types';

export const displayCategoryName = (category: string) => capitalize(category).replace('-', ' ');

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
