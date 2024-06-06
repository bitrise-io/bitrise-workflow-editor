import { Input, TabPanel, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues, WorkflowConfigTab } from '../WorkflowConfigPanel.types';

const PropertiesTabPanel = () => {
  const { register, watch } = useFormContext<FormValues>();
  const workflowId = watch('workflowId');

  return (
    <TabPanel id={WorkflowConfigTab.PROPERTIES} display="flex" flexDir="column" gap="24" p="24">
      <Input label="Title" {...register('properties.title')} placeholder={workflowId} isRequired />
      <Textarea label="Summary" {...register('properties.summary')} isRequired />
      <Textarea label="Description" {...register('properties.description')} isRequired />
    </TabPanel>
  );
};

export default PropertiesTabPanel;
