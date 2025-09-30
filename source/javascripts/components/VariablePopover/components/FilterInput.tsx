import { SearchInput, SearchInputProps } from '@bitrise/bitkit';
import { debounce } from 'es-toolkit';
import { forwardRef, useCallback, useState } from 'react';

const DEBOUNCE_TIME = 300;

export type FilterInputProps = SearchInputProps & {
  debounceTime?: number;
};

const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(
  ({ value: initialValue = '', onChange, debounceTime = DEBOUNCE_TIME, ...rest }, ref) => {
    const [state, setState] = useState(initialValue);

    const onChangeHandler = useCallback(
      (filterValue: string) => {
        setState(filterValue);
        debounce(() => onChange(filterValue), debounceTime)();
      },
      [debounceTime, onChange],
    );

    return <SearchInput inputRef={ref} autoFocus name="filter" value={state} onChange={onChangeHandler} {...rest} />;
  },
);

export default FilterInput;
