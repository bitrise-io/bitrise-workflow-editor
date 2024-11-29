import { BoxProps, SearchInput } from '@bitrise/bitkit';
import { Controller } from 'react-hook-form';
import { SearchFormValues } from '@/components/unified-editor/StepSelectorDrawer/StepSelectorDrawer.types';

const StepBundleFilter = (props: BoxProps) => {
  return (
    <Controller<SearchFormValues>
      name="filterStepBundles"
      render={({ field: { ref, onChange, ...rest } }) => (
        <SearchInput
          inputRef={ref}
          placeholder="Filter by name..."
          {...rest}
          {...props}
          onChange={(value) => onChange({ target: { value } })}
        />
      )}
    />
  );
};

export default StepBundleFilter;
