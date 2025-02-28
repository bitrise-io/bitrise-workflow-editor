import { Box, Checkbox, Input, Textarea } from '@bitrise/bitkit';
import { useController, useFormContext } from 'react-hook-form';
import { FormItems } from '@/components/unified-editor/StepBundlesConfig/StepBundle.types';

const StepBundleAdditionalFields = () => {
  const { register } = useFormContext<FormItems>();
  const {
    field: { onChange, value, ...rest },
  } = useController({ name: 'opts.value_options' });

  const handleValueOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.split('\n'));
  };

  return (
    <Box display="flex" flexDirection="column" gap={16}>
      <Input label="Summary" {...register('opts.summary')} />
      <Textarea
        label="Value options"
        helperText="Add values as new lines."
        value={value.join('\n')}
        onChange={handleValueOptionsChange}
        {...rest}
      />
      <Input label="Category" {...register('opts.category')} />
      <Textarea label="Description" {...register('opts.description')} />
      <Checkbox helperText="Input must have a valid value, or the Step will fail." {...register('opts.is_required')}>
        Required
      </Checkbox>
      <Checkbox helperText="Input accepts only Secrets as values." {...register('opts.is_sensitive')}>
        Sensitive
      </Checkbox>
      <Checkbox
        helperText="The default value shouldn't be changed on the UI."
        {...register('opts.is_dont_change_value')}
      >
        Read-only value
      </Checkbox>
      <Checkbox
        helperText="If a value is an Env Var, the CLI will pass its value to the Step. Uncheck to pass the key as a string."
        {...register('opts.is_expand')}
      >
        Expand Env Vars in inputs
      </Checkbox>
    </Box>
  );
};

export default StepBundleAdditionalFields;
