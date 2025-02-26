import { Box, Checkbox, Input, Textarea } from '@bitrise/bitkit';
import { Controller, useFormContext } from 'react-hook-form';

const StepBundleAdditionalFields = () => {
  const { control, register } = useFormContext();

  return (
    <Box display="flex" flexDirection="column" gap={16}>
      <Controller
        name="summary"
        control={control}
        render={({ field }) => <Input {...field} label="Summary" value={field.value} onChange={field.onChange} />}
      />
      <Controller
        name="valueOptions"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Value options"
            value={field.value}
            onChange={field.onChange}
            helperText="Add values as new lines."
          />
        )}
      />
      <Controller
        name="category"
        control={control}
        render={({ field }) => <Input {...field} label="Category" value={field.value} onChange={field.onChange} />}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea {...field} label="Description" value={field.value} onChange={field.onChange} />
        )}
      />
      <Checkbox helperText="Input must have a valid value, or the Step will fail." {...register('isRequired')}>
        Required
      </Checkbox>
      <Checkbox helperText="Input accepts only Secrets as values." {...register('isSensitive')}>
        Sensitive
      </Checkbox>
      <Checkbox helperText="The default value shouldn't be changed on the UI." {...register('isReadOnly')}>
        Read-only value
      </Checkbox>
      <Checkbox
        helperText="If a value is an Env Var, the CLI will pass its value to the Step. Uncheck to pass the key as a string."
        {...register('isExpand')}
      >
        Expand Env Vars in inputs
      </Checkbox>
    </Box>
  );
};

export default StepBundleAdditionalFields;
