import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { WorkflowConfigTab } from './WorkflowConfig.types';

type Props = {
  workflowId: string;
};

const WorkflowConfigPanelContent = () => {
  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
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
