import { useMemo } from 'react';
import uniq from 'lodash/uniq';
import useAlgoliaSteps from '../../../hooks/useAlgoliaSteps';

const useStepCategories = () => {
  const stepObjs = useAlgoliaSteps();
  const categories = useMemo(() => {
    return uniq(stepObjs.flatMap((obj) => obj.step?.type_tags || [])).sort();
  }, [stepObjs]);
  return { categories };
};

export default useStepCategories;
