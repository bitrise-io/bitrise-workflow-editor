import { Box, SearchInput, Tag } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';

type Props = {
  categories?: string[];
};

const StepFilter = ({ categories = [] }: Props) => {
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
          <Tag size="sm">{category}</Tag>
        ))}
      </Box>
    </Box>
  );
};

export default StepFilter;
