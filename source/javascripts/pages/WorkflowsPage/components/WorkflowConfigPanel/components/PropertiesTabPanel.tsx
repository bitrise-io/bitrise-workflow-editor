import { Input, TabPanel, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import WorkflowService from '@/core/models/WorkflowService';
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
          validate: (v) => WorkflowService.validateName(v),
        })}
      />
      <Textarea label="Summary" {...register('properties.summary')} />
      <Textarea label="Description" {...register('properties.description')} />
    </TabPanel>
  );
};

export default PropertiesTabPanel;
