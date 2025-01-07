import { memo, useMemo } from 'react';
import { Box, BoxProps, SearchInput, SelectableTag, SelectableTagGroup } from '@bitrise/bitkit';

import { capitalize, startCase } from 'es-toolkit';
import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/models/StepService';
import useSearch from '../hooks/useSearch';

const StepFilterCategories = memo(() => {
  const { data: steps = [] } = useAlgoliaSteps();
  const categories = useMemo(() => StepService.getStepCategories(steps), [steps]);

  const value = useSearch((s) => s.stepCategoryFilter);
  const onChange = useSearch((s) => s.setSearchStepCategories);

  return (
    <SelectableTagGroup rowGap="16" columnGap="8" display="flex" flexWrap="wrap" value={value} onChange={onChange}>
      {categories.map((category) => (
        <SelectableTag key={category} value={category}>
          {capitalize(startCase(category))}
        </SelectableTag>
      ))}
    </SelectableTagGroup>
  );
});

const StepFilter = (props: BoxProps) => {
  const value = useSearch((s) => s.stepQuery);
  const onChange = useSearch((s) => s.setSearchStep);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <SearchInput autoFocus placeholder="Filter by name or description..." value={value} onChange={onChange} />
      <StepFilterCategories />
    </Box>
  );
};

export default StepFilter;
