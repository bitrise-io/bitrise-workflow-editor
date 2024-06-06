import { FormProvider, useForm } from 'react-hook-form';
import { Tab, TabList, TabPanels, Tabs } from '@bitrise/bitkit';
import { PartialDeep } from 'type-fest';
import Header from './components/Header';
import { FormValues } from './WorkflowConfigPanel.types';
import PropertiesTabPanel, { PROPERTIES_TAB_ID } from './components/PropertiesTabPanel';
import ConfigurationTabPanel, { CONFIGURATION_TAB_ID } from './components/ConfigurationTabPanel';

type Props = {
  workflowId: string;
  defaultValues?: PartialDeep<Omit<FormValues, 'workflowId'>>;
  onChange: (data: FormValues) => void;
};

const WorkflowConfigPanel = ({ workflowId, defaultValues, onChange }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      workflowId,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onChange(data);
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} onChange={handleSubmit}>
        <Header />
        <Tabs>
          <TabList px="8">
            <Tab id={CONFIGURATION_TAB_ID}>Configuration</Tab>
            <Tab id={PROPERTIES_TAB_ID}>Properties</Tab>
          </TabList>
          <TabPanels>
            <ConfigurationTabPanel />
            <PropertiesTabPanel />
          </TabPanels>
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default WorkflowConfigPanel;
