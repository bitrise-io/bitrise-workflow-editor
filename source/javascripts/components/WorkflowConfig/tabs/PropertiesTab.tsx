import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfig.types';

const PropertiesTab = () => {
  const { register, formState } = useFormContext<FormValues>();

  return (
    <Box gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        errorText={formState.errors.properties?.name?.message}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('properties.name', {
          required: {
            value: true,
            message: 'Name is required.',
          },
          validate: {
            isNotEmpty: (value) => !!value.trim() || 'Name should not be empty.',
          },
          pattern: {
            value: /^[a-zA-Z0-9_-]+$/i,
            message: 'Name should contain letters, numbers, underscores & hyphens.',
          },
        })}
      />
      <Textarea label="Summary" {...register('properties.summary')} />
      <Textarea label="Description" {...register('properties.description')} />
    </Box>
  );
};

export default PropertiesTab;
