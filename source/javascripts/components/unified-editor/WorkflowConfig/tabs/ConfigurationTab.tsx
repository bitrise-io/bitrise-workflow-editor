import { Box } from '@bitrise/bitkit';

import WorkflowService from '@/core/services/WorkflowService';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import EnvVarsCard from '../components/EnvVarsCard';
import PipelineConditionsCard from '../components/PipelineConditionsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';
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
    <Box display="flex" flexDir="column" gap="16">
      {context === 'pipeline' && !isChainedWorkflow && <PipelineConditionsCard />}
      {RuntimeUtils.isWebsiteMode() && !isUtilityWorkflow && <StackAndMachineCard />}
      <EnvVarsCard />
    </Box>
  );
};

export default ConfigurationTab;
