import { Box, SearchInput, Tag } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

import useStepCategories from '../hooks/useStepCategories';

const StepFilter = () => {
  const { categories } = useStepCategories();

  return (
    <Box display="flex" flexDir="column" gap="16">
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
      <Box display="flex" flexWrap="wrap" gap="8">
        {categories.map((category) => (
          <Tag key={category} size="sm">
            {category}
          </Tag>
        ))}
      </Box>
    </Box>
  );
};

export default StepFilter;
