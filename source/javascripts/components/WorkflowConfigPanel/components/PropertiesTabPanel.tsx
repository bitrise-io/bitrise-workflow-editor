import { Input, TabPanel, Textarea } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';

export const PROPERTIES_TAB_ID = 'properties';

const PropertiesTabPanel = () => {
  const { register, getValues } = useFormContext<FormValues>();
  const workflowId = getValues('workflowId');

  return (
    <TabPanel id={PROPERTIES_TAB_ID} display="flex" flexDir="column" gap="24" p="24">
      <Input label="Title" {...register('properties.title')} placeholder={workflowId} isRequired />
      <Textarea label="Summary" {...register('properties.summary')} isRequired />
      <Textarea label="Description" {...register('properties.description')} isRequired />
    </TabPanel>
  );
};

export default PropertiesTabPanel;
