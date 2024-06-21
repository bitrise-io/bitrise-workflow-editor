import { fromAlgolia, SearchFormValues, Step } from '../StepDrawer.types';
import useAlgoliaSteps from '../../../hooks/useAlgoliaSteps';

const useSearchSteps = ({ search, categories }: SearchFormValues): { steps: Step[] } => {
  const stepObjs = useAlgoliaSteps();
  const searchValue = search.toLowerCase();
  let steps = stepObjs.map(fromAlgolia).filter(Boolean) as Step[];

  if (categories.length > 0) {
    steps = steps.filter((step) => step?.categories.some((category) => categories.includes(category)));
  }

  if (searchValue) {
    steps = steps.filter((step) => {
      const name = step?.title.toLowerCase();
      const description = step?.description.toLowerCase();
      return name?.includes(searchValue) || description?.includes(searchValue);
    });
  }

  return { steps };
};

export default useSearchSteps;
