import { useMemo } from 'react';
import uniq from 'lodash/uniq';
import { useAlgoliaSteps } from '@/hooks/service/useAlgolia';

const useStepCategories = () => {
  const { data: steps = [] } = useAlgoliaSteps({
    attributesToRetrieve: ['cvs', 'step.type_tags'],
  });

  return useMemo(() => uniq(steps.flatMap((step) => step.step?.type_tags || [])).sort(), [steps]);
};

export default useStepCategories;
