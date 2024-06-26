import { useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import { SearchFormValues } from '../StepDrawer.types';
import useSearchSteps from '../hooks/useSearchSteps';
import StepCategoryGrid from './StepCategoryGrid';

const InitialValues: SearchFormValues = {
  search: '',
  categories: [],
};

type Props = {
  onStepSelected: (cvs: string) => void;
};

const StepList = ({ onStepSelected }: Props) => {
  const { watch } = useFormContext<SearchFormValues>();
  const [debounced, setDebounced] = useDebounceValue<SearchFormValues>(InitialValues, 300);
  const { data: stepsByCategories = {}, isLoading, isError } = useSearchSteps(debounced);

  useEffect(() => {
    const { unsubscribe } = watch((value) => {
      setDebounced(value as SearchFormValues);
    });
    return () => unsubscribe();
  }, [watch, setDebounced]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (isError) {
    return <Box>Error...</Box>;
  }

  return (
    <Box display="flex" flexDir="column" gap="16" overflowY="auto">
      {Object.entries(stepsByCategories)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([category, steps]) => (
          <StepCategoryGrid key={category} category={category} steps={steps} onStepSelected={onStepSelected} />
        ))}
    </Box>
  );
};

export default StepList;
