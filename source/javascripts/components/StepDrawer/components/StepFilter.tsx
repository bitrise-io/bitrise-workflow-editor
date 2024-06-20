import { Box, BoxProps, SearchInput, SelectableTag, SelectableTagGroup } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

import useStepCategories from '../hooks/useStepCategories';
import { SearchFormValues } from '../StepDrawer.types';
import { formValueToArray } from '../StepDrawer.utils';

type Props = BoxProps;

const StepFilter = (props: Props) => {
  const categories = useStepCategories();

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <Controller
        name="search"
        render={({ field: { ref, onChange, ...rest } }) => (
          <SearchInput
            inputRef={ref}
            placeholder="Filter by name or description"
            onChange={(value) => onChange({ target: { value } })}
            {...rest}
          />
        )}
      />
      <Controller<SearchFormValues>
        name="categories"
        render={({ field: { ref, value, ...rest } }) => (
          <SelectableTagGroup {...rest} value={formValueToArray(value)} display="flex" flexWrap="wrap" gap="8">
            {categories.map((category) => (
              <SelectableTag key={category} value={category}>
                {category}
              </SelectableTag>
            ))}
          </SelectableTagGroup>
        )}
      />
    </Box>
  );
};

export default StepFilter;
