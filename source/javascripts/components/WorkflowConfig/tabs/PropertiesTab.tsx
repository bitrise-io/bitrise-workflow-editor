import { useEffect, useMemo } from 'react';
import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const PropertiesTab = () => {
  const { id: name, summary = '', description = '' } = useWorkflowConfigContext();
  const defaultValues = useMemo(() => ({ name, summary, description }), [name, summary, description]);

  const { reset, trigger, register, formState } = useForm({
    mode: 'all',
    defaultValues,
  });

  // NOTE: Reset form default values when the selected workflow was changed.
  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  // NOTE: Trigger form validation when the selected workflow was changed.
  useEffect(() => {
    trigger();
  }, [trigger, formState.defaultValues]);

  return (
    <Box as="form" gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        errorText={formState.errors.name?.message?.toString()}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('name', {
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
      <Textarea label="Summary" {...register('summary')} />
      <Textarea label="Description" {...register('description')} />
    </Box>
  );
};

export default PropertiesTab;
