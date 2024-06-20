import { useMemo } from 'react';
import uniq from 'lodash/uniq';
import { MockSteps } from '../StepDrawer.mocks';
import { FilterFormValues } from '../StepDrawer.types';

export const useSteps = () => {
  const steps = useMemo(() => MockSteps, []);
  return { steps };
};

export const useCategories = () => {
  const { steps } = useSteps();
  const categories = useMemo(() => {
    return uniq(steps.flatMap((step) => step.categories));
  }, [steps]);
  return { categories };
};

export const useFilter = ({ categories, search }: FilterFormValues) => {
  const { steps } = useSteps();
  const searchValue = search.toLowerCase();
  let filteredSteps = steps;

  if (categories.length > 0) {
    filteredSteps = steps.filter((step) => step.categories.some((category) => categories.includes(category)));
  }

  if (searchValue) {
    filteredSteps = steps.filter((step) => {
      const name = step.title.toLowerCase();
      const description = step.description.toLowerCase();
      return name.includes(searchValue) || description.includes(searchValue);
    });
  }

  return { steps: filteredSteps };
};
