import { TabPanel } from '@bitrise/bitkit';
import { WorkflowConfigTab } from '../WorkflowConfigPanel.types';
import StackAndMachineCard from './StackAndMachineCard';
import EnvVarsCard from './EnvVarsCard';

const ConfigurationTabPanel = () => {
  return (
    <TabPanel id={WorkflowConfigTab.CONFIGURATION} display="flex" flexDir="column" gap="24" p="24">
      <StackAndMachineCard />
      <EnvVarsCard />
    </TabPanel>
  );
};

export default ConfigurationTabPanel;
