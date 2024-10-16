import { Box } from '@bitrise/bitkit';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import EnvVarsCard from '../components/EnvVarsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';

const ConfigurationTab = () => {
  return (
    <Box display="flex" flexDir="column" gap="24">
      {RuntimeUtils.isWebsiteMode() && <StackAndMachineCard />}
      <EnvVarsCard />
    </Box>
  );
};

export default ConfigurationTab;
