import { Box, BoxProps, SearchInput, SelectableTag, SelectableTagGroup } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/models/StepService';
import { SearchFormValues } from '../StepDrawer.types';
import { formValueToArray } from '../StepDrawer.utils';

type Props = BoxProps;

const StepFilter = (props: Props) => {
  const { data: steps = [] } = useAlgoliaSteps();
  const categories = StepService.getStepCategories(steps);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <Controller<SearchFormValues>
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
          <SelectableTagGroup
            display="flex"
            flexWrap="wrap"
            columnGap="8"
            rowGap="16"
            value={formValueToArray(value)}
            {...rest}
          >
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
