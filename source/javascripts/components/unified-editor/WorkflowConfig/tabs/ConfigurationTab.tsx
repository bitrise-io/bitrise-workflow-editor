import { Box } from '@bitrise/bitkit';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import EnvVarsCard from '../components/EnvVarsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';
import PipelineConditionsCard from '../components/PipelineConditionsCard';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type ConfigurationTabProps = {
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const ConfigurationTab = ({ context, parentWorkflowId }: ConfigurationTabProps) => {
  const { id = '' } = useWorkflowConfigContext() || {};
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(id);
  const isChainedWorkflow = !!parentWorkflowId;

  return (
    <Box display="flex" flexDir="column" gap="24">
      {context === 'pipeline' && !isChainedWorkflow && <PipelineConditionsCard />}
      {RuntimeUtils.isWebsiteMode() && !isUtilityWorkflow && <StackAndMachineCard />}
      <EnvVarsCard />
    </Box>
  );
};

export default ConfigurationTab;
