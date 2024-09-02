import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import { FormValues } from '../WorkflowConfig.types';

const PropertiesTab = () => {
  const workflows = useWorkflows();
  const wofkflowIds = Object.keys(workflows);
  const { register, formState } = useFormContext<FormValues>();

  return (
    <Box gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        errorText={formState.errors.properties?.name?.message}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        {...register('properties.name', {
          validate: (v) => WorkflowService.validateName(v, wofkflowIds),
        })}
      />
      <Textarea label="Summary" {...register('properties.summary')} />
      <Textarea label="Description" {...register('properties.description')} />
    </Box>
  );
};

export default PropertiesTab;
