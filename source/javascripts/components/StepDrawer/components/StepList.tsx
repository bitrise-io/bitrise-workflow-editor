import { useMemo } from 'react';
import { Box } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

import { SearchFormValues } from '../StepDrawer.types';
import { getStepsByCategories } from '../StepDrawer.utils';
import useSearchSteps from '../hooks/useSearchSteps';
import StepCategoryGrid from './StepCategoryGrid';

const StepList = () => {
  const form = useFormContext<SearchFormValues>();
  const { steps } = useSearchSteps(form.watch());
  const stepsByCategories = useMemo(() => getStepsByCategories(steps), [steps]);

  return (
    <Box display="flex" flexDir="column" gap="16">
      {Object.entries(stepsByCategories).map(([category, categorySteps]) => (
        <StepCategoryGrid key={category} category={category} steps={categorySteps} />
      ))}
    </Box>
  );
};

export default StepList;
