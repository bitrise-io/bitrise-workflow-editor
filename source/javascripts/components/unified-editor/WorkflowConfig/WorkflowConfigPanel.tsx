import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import TriggersTabPanel from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/components/TriggersTabPanel';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { WorkflowConfigTab } from './WorkflowConfig.types';

const WorkflowConfigPanelContent = () => {
  const isTargetBasedTriggersEnabled = useFeatureFlag('enable-target-based-triggers');

  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <WorkflowConfigHeader variant="panel" />
      <TabPanels flex="1" minH="0">
        <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
          <ConfigurationTab />
        </TabPanel>
        <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
          <PropertiesTab variant="panel" />
        </TabPanel>
        {isTargetBasedTriggersEnabled && (
          <TabPanel id={WorkflowConfigTab.TRIGGERS} overflowY="auto" h="100%">
            <TriggersTabPanel />
          </TabPanel>
        )}
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
