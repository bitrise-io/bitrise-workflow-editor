import { TabPanel } from '@bitrise/bitkit';
import { WorkflowConfigTab } from '../WorkflowConfigPanel.types';

const ConfigurationTabPanel = () => {
  return (
    <TabPanel id={WorkflowConfigTab.CONFIGURATION} display="flex" flexDir="column" gap="24" p="24">
      Configuration
    </TabPanel>
  );
};

export default ConfigurationTabPanel;
