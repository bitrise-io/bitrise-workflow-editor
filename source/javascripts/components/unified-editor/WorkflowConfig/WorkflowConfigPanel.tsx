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
import useLockFormReset from './hooks/useLockFormReset';

type Props = {
  workflowId: string;
};

const WorkflowConfigPanelContent = ({ workflowId }: Props) => {
  const lockFormReset = useLockFormReset();
  const form = useFormContext<FormValues>();
  const [, setSearchParams] = useSearchParams();
  const updateWorkflow = useBitriseYmlStore(useShallow((s) => s.updateWorkflow));
  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    setSearchParams((searchParams) => ({
      ...searchParams,
      workflow_id: newWorkflowId,
    }));
  });

  const handleChange = form.handleSubmit(({ properties: { name, ...properties } }) => {
    lockFormReset();
    updateWorkflow(workflowId, properties);
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

const WorkflowConfigPanel = ({ workflowId, ...props }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigPanelContent workflowId={workflowId} {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigPanel;
