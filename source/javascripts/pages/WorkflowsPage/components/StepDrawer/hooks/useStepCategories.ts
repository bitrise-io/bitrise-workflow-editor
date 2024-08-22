import { useMemo } from 'react';
import uniq from 'lodash/uniq';
import { useAlgoliaSteps } from '@/hooks/useAlgolia';

const useStepCategories = () => {
  const { data: steps = [] } = useAlgoliaSteps();
  return useMemo(() => uniq(steps.flatMap((step) => step.type_tags || [])).sort(), [steps]);
};

export default useStepCategories;
