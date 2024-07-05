import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import { SearchFormValues } from '../StepDrawer.types';

const InitialValues: SearchFormValues = {
  search: '',
  categories: [],
};

const DebounceDelay = 150;

const useDebouncedFormValues = () => {
  const { watch } = useFormContext<SearchFormValues>();
  const [debouncedValues, setDebouncedValues] = useDebounceValue<SearchFormValues>(InitialValues, DebounceDelay);

  useEffect(() => {
    const { unsubscribe } = watch((value) => {
      setDebouncedValues(value as SearchFormValues);
    });
    return () => unsubscribe();
  }, [watch, setDebouncedValues]);

  return debouncedValues;
};

export default useDebouncedFormValues;
