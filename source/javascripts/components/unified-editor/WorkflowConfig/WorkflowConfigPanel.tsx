import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import useSearchParams from '@/hooks/useSearchParams';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';
import useRenameWorkflow from './hooks/useRenameWorkflow';

const WorkflowConfigPanelContent = () => {
  const form = useFormContext<FormValues>();
  const originalName = form.formState.defaultValues?.properties?.name ?? '';
  const [, setSearchParams] = useSearchParams();
  const updateWorkflow = useBitriseYmlStore(useShallow((s) => s.updateWorkflow));
  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    setSearchParams((searchParams) => ({
      ...searchParams,
      workflow_id: newWorkflowId,
    }));
  });

  const handleChange = form.handleSubmit(({ properties: { name, ...properties } }) => {
    updateWorkflow(originalName, properties);
    renameWorkflow(name);
  });

  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <WorkflowConfigHeader />
      <TabPanels as="form" flex="1" minH="0" onChange={handleChange} onSubmit={handleChange}>
        <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
          <ConfigurationTab />
        </TabPanel>
        <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
          <PropertiesTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type Props = {
  workflowId: string;
};

const WorkflowConfigPanel = ({ workflowId }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigPanelContent />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigPanel;
