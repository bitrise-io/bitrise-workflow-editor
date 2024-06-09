import { FormProvider, useForm } from 'react-hook-form';
import { Tab, TabList, TabPanels, Tabs } from '@bitrise/bitkit';
import { PartialDeep } from 'type-fest';
import { getAppSlug } from '../../services/app-service';
import Header from './components/Header';
import { FormValues, WorkflowConfigTab } from './WorkflowConfigPanel.types';
import PropertiesTabPanel from './components/PropertiesTabPanel';
import ConfigurationTabPanel from './components/ConfigurationTabPanel';

type Props = {
  appSlug?: string;
  workflowId: string;
  defaultValues?: PartialDeep<Omit<FormValues, 'workflowId'>>;
  onChange: (data: FormValues) => void;
};

const WorkflowConfigPanel = ({ appSlug = getAppSlug() || undefined, workflowId, defaultValues, onChange }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      appSlug,
      workflowId,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(onChange);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} onChange={handleSubmit}>
        <Header />
        <Tabs>
          <TabList px="8">
            <Tab id={WorkflowConfigTab.CONFIGURATION}>Configuration</Tab>
            <Tab id={WorkflowConfigTab.PROPERTIES}>Properties</Tab>
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
