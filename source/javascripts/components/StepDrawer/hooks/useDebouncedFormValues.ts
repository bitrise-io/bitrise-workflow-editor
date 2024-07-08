import { useEffect } from 'react';
import { FieldValues, UseFormWatch } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';

const DebounceDelay = 150;

type Props<T extends FieldValues> = {
  watch: UseFormWatch<T>;
  initialValues: T;
  delay?: number;
};

const useDebouncedFormValues = <T extends FieldValues>({ watch, initialValues, delay = DebounceDelay }: Props<T>) => {
  const [debouncedValues, setDebouncedValues] = useDebounceValue<T>(initialValues, delay);

  useEffect(() => {
    const { unsubscribe } = watch((value) => {
      setDebouncedValues(value as T);
    });
    return () => unsubscribe();
  }, [watch, setDebouncedValues]);

  return debouncedValues;
};

export default useDebouncedFormValues;
