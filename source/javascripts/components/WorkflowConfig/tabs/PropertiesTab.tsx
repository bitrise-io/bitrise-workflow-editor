import { useEffect, useMemo } from 'react';
import { Box, Input, Text, Textarea } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const PropertiesTab = () => {
  const result = useWorkflowConfigContext();
  const defaultValues = useMemo(() => {
    return {
      name: result?.userValues.title || '',
      summary: result?.userValues.summary || '',
      description: result?.userValues.description || '',
    };
  }, [result]);

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

  if (!result) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box as="form" gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        errorText={formState.errors.name?.message?.toString()}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('name', {
          validate: (v) => WorkflowService.validateName(v),
        })}
      />
      <Textarea label="Summary" {...register('summary')} />
      <Textarea label="Description" {...register('description')} />
    </Box>
  );
};

export default PropertiesTab;
