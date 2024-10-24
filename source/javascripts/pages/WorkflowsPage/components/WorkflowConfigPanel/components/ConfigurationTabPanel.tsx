import { TabPanel } from '@bitrise/bitkit';
import StackAndMachineCard from './StackAndMachineCard';
import EnvVarsCard from './EnvVarsCard';

const ConfigurationTabPanel = () => {
  return (
    <TabPanel display="flex" flexDir="column" gap="24" p="24">
      <StackAndMachineCard />
      <EnvVarsCard />
    </TabPanel>
  );
};

export default ConfigurationTabPanel;
