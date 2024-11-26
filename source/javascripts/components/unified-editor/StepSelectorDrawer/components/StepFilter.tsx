import { useMemo } from 'react';
import { Box, BoxProps, SearchInput, SelectableTag, SelectableTagGroup } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/models/StepService';
import { SearchFormValues } from '../StepSelectorDrawer.types';
import { formValueToArray } from '../StepSelectorDrawer.utils';

interface StepFilterProps extends BoxProps {
  activeTab: 'step' | 'stepBundle';
}

const StepFilter = (props: StepFilterProps) => {
  const { activeTab } = props;
  const { data: steps = [] } = useAlgoliaSteps();
  const categories = useMemo(() => StepService.getStepCategories(steps), [steps]);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <Controller<SearchFormValues>
        name="search"
        render={({ field: { ref, onChange, ...rest } }) => (
          <SearchInput
            inputRef={ref}
            placeholder={activeTab === 'step' ? 'Filter by name or description...' : 'Filter by name...'}
            onChange={(value) => onChange({ target: { value } })}
            {...rest}
          />
        )}
      />
      {activeTab === 'step' && (
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
                <SelectableTag key={category} value={category} mb={24}>
                  {category}
                </SelectableTag>
              ))}
            </SelectableTagGroup>
          )}
        />
      )}
    </Box>
  );
};

export default StepFilter;
