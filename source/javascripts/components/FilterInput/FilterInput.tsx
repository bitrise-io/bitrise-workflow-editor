import { forwardRef, useCallback, useState } from 'react';
import debounce from 'lodash/debounce';
import { InputProps, SearchInput } from '@bitrise/bitkit';

const DEBOUNCE_TIME = 300;

type Props = Omit<InputProps, 'value' | 'onChange'> & {
  placeholder: string;
  filter?: string;
  onFilterChange: (filter: string) => void;
  debounceTime?: number;
};

const FilterInput = forwardRef<HTMLInputElement, Props>(
  ({ filter = '', onFilterChange, debounceTime = DEBOUNCE_TIME, ...rest }, ref) => {
    const [state, setState] = useState(filter);

    const onChangeHandler = useCallback(
      (value: string) => {
        setState(value);
        debounce(() => onFilterChange(value), debounceTime)();
      },
      [debounceTime, onFilterChange],
    );

    return <SearchInput inputRef={ref} autoFocus name="filter" value={state} onChange={onChangeHandler} {...rest} />;
  },
);

export default FilterInput;
