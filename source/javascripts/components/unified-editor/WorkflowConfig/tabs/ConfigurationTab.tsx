import { Box } from '@bitrise/bitkit';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import EnvVarsCard from '../components/EnvVarsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';
import PipelineConditionsCard from '../components/PipelineConditionsCard';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type ConfigurationTabProps = {
  context: 'pipeline' | 'workflow';
};

const ConfigurationTab = ({ context }: ConfigurationTabProps) => {
  const workflow = useWorkflowConfigContext();
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflow?.id || '');

  return (
    <Box display="flex" flexDir="column" gap="24">
      {context === 'pipeline' && <PipelineConditionsCard />}
      {RuntimeUtils.isWebsiteMode() && !isUtilityWorkflow && <StackAndMachineCard />}
      <EnvVarsCard />
    </Box>
  );
};

export default ConfigurationTab;
