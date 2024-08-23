import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider, { useWorkflowConfigContext } from './WorkflowConfig.context';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';
import useRenameWorkflow from './hooks/useRenameWorkflow';

type Props = {
  workflowId: string;
};

const RenameWatcher = () => {
  const { id } = useWorkflowConfigContext();
  const renameWorkflow = useRenameWorkflow();
  const { watch } = useFormContext<FormValues>();
  const newWorkflowId = watch('properties.name', id);

  useEffect(() => {
    if (id !== newWorkflowId) {
      renameWorkflow(newWorkflowId);
    }
  }, [id, newWorkflowId, renameWorkflow]);

  return null;
};

const WorkflowConfigPanelContent = () => {
  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <RenameWatcher />
      <WorkflowConfigHeader />
      <TabPanels flex="1" minH="0">
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

const WorkflowConfigPanel = ({ workflowId, ...props }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigPanelContent {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigPanel;
