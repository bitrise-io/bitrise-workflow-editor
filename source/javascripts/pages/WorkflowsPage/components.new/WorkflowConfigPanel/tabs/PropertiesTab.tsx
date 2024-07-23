import { useEffect } from 'react';
import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import useSelectedWorkflow from '@/pages/WorkflowsPage/hooks/useSelectedWorkflow';

const PropertiesTab = () => {
  const [{ id: name, summary, description }] = useSelectedWorkflow();

  const {
    reset,
    trigger,
    register,
    formState: { errors, defaultValues },
  } = useForm({
    mode: 'all',
    defaultValues: {
      name,
      summary,
      description,
    },
  });

  // NOTE: Reset default values when the selected workflow changed.
  useEffect(() => {
    reset({ name, summary, description });
  }, [reset, name, summary, description]);

  // NOTE: Trigger validation when default values are changed.
  useEffect(() => {
    trigger();
  }, [trigger, defaultValues]);

  return (
    <Box as="form" gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        errorText={errors.name?.message?.toString()}
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
