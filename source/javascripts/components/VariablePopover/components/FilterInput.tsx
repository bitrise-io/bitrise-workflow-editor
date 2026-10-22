import { BitkitSearchInput, BitkitSearchInputProps } from '@bitrise/bitkit-v2';
import { debounce } from 'es-toolkit';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_TIME = 300;

export type FilterInputProps = Omit<BitkitSearchInputProps, 'onChange'> & {
  debounceTime?: number;
  onChange: (value: string) => void;
};

const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(
  ({ value: initialValue = '', onChange, debounceTime = DEBOUNCE_TIME, ...rest }, ref) => {
    const [state, setState] = useState(initialValue);
    const debouncedOnChange = useMemo(() => debounce(onChange, debounceTime), [onChange, debounceTime]);

    useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

    const onChangeHandler = useCallback(
      (filterValue: string) => {
        setState(filterValue);
        debouncedOnChange(filterValue);
      },
      [debouncedOnChange],
    );

    return <BitkitSearchInput inputRef={ref} value={state} onChange={onChangeHandler} {...rest} />;
  },
);

FilterInput.displayName = 'FilterInput';

export default FilterInput;
