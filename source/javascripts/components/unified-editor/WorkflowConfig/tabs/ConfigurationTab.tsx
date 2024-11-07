import { Box } from '@bitrise/bitkit';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import EnvVarsCard from '../components/EnvVarsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';
import PipelineConditionsCard from '../components/PipelineConditionsCard';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const ConfigurationTab = () => {
  const workflow = useWorkflowConfigContext();
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflow?.id || '');

  return (
    <Box display="flex" flexDir="column" gap="24">
      <PipelineConditionsCard />
      {RuntimeUtils.isWebsiteMode() && !isUtilityWorkflow && <StackAndMachineCard />}
      <EnvVarsCard />
    </Box>
  );
};

export default ConfigurationTab;
