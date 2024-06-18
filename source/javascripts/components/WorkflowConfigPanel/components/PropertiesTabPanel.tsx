import { Input, TabPanel, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues, WorkflowConfigTab } from '../WorkflowConfigPanel.types';

const PropertiesTabPanel = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <TabPanel id={WorkflowConfigTab.PROPERTIES} display="flex" flexDir="column" gap="24" p="24">
      <Input
        isRequired
        label="Name"
        errorText={errors.workflowId?.message?.toString()}
        {...register('workflowId', {
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
    </TabPanel>
  );
};

export default PropertiesTabPanel;
