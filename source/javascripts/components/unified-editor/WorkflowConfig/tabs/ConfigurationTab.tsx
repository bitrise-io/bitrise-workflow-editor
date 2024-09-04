import { Box } from '@bitrise/bitkit';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import EnvVarsCard from '../components/EnvVarsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';

const ConfigurationTab = () => {
  if (RuntimeUtils.isWebsiteMode()) {
    return (
      <Box display="flex" flexDir="column" gap="24">
        <StackAndMachineCard />
        <EnvVarsCard />
      </Box>
    );
  }

  return <EnvVarsCard />;
};

export default ConfigurationTab;
