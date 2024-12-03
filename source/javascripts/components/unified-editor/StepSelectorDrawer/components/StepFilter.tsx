import { useMemo } from 'react';
import { Box, BoxProps, SearchInput, SelectableTag, SelectableTagGroup } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/models/StepService';
import { SearchFormValues } from '../StepSelectorDrawer.types';
import { formValueToArray } from '../StepSelectorDrawer.utils';

const StepFilter = (props: BoxProps) => {
  const { data: steps = [] } = useAlgoliaSteps();
  const categories = useMemo(() => StepService.getStepCategories(steps), [steps]);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <Controller<SearchFormValues>
        name="searchSteps"
        render={({ field: { ref, onChange, ...rest } }) => (
          <SearchInput
            autoFocus
            inputRef={ref}
            placeholder="Filter by name or description..."
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
            mb={24}
            value={formValueToArray(value || '')}
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
