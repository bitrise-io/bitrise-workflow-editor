import { useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

import { useDebounceValue } from 'usehooks-ts';
import { SearchFormValues } from '../StepDrawer.types';
import useSearchSteps from '../hooks/useSearchSteps';
import StepCategoryGrid from './StepCategoryGrid';

const StepList = () => {
  const form = useFormContext<SearchFormValues>();
  const [debounced, setDebounced] = useDebounceValue<SearchFormValues>({ search: '', categories: [] }, 300);
  const { data: stepsByCategories = {}, isLoading, isError } = useSearchSteps(debounced);
  const categories = Object.keys(stepsByCategories).sort();

  useEffect(() => {
    const { unsubscribe } = form.watch((formValues) => {
      setDebounced(formValues as Required<SearchFormValues>);
    });

    return () => unsubscribe();
  });

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (isError) {
    return <Box>Error...</Box>;
  }

  return (
    <Box display="flex" flexDir="column" gap="16" overflowY="auto">
      {categories.map((category) => (
        <StepCategoryGrid key={category} category={category} steps={stepsByCategories[category]} />
      ))}
    </Box>
  );
};

export default StepList;
