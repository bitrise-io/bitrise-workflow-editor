import { Box, Checkbox, Input, Textarea } from '@bitrise/bitkit';
import { Controller, useFormContext } from 'react-hook-form';

export type FormItems = {
  key: string;
  default_value: string;
  opts: {
    title: string;
    summary: string;
    value_options: string;
    category: string;
    description: string;
    is_required: boolean;
    is_expand: boolean;
    is_sensitive: boolean;
    is_dont_change_value: boolean;
  };
};

const StepBundleAdditionalFields = () => {
  const { control, register } = useFormContext<FormItems>();

  return (
    <Box display="flex" flexDirection="column" gap={16}>
      <Controller name="opts.summary" control={control} render={({ field }) => <Input label="Summary" {...field} />} />
      <Controller
        name="opts.value_options"
        control={control}
        render={({ field }) => <Textarea label="Value options" helperText="Add values as new lines." {...field} />}
      />
      <Controller
        name="opts.category"
        control={control}
        render={({ field }) => <Input label="Category" {...field} />}
      />
      <Controller
        name="opts.description"
        control={control}
        render={({ field }) => <Textarea label="Description" {...field} />}
      />
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
