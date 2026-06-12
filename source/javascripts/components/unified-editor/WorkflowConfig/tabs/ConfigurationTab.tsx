import { Box } from '@bitrise/bitkit';

import WorkflowService from '@/core/services/WorkflowService';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCrossFileEntity } from '@/hooks/useTree';

import CrossFileDefinitionCard from '../components/CrossFileDefinitionCard';
import EnvVarsCard from '../components/EnvVarsCard';
import PipelineConditionsCard from '../components/PipelineConditionsCard';
import StackAndMachineCard from '../components/StackAndMachineCard';
import { useWorkflowConfigId } from '../WorkflowConfig.context';

type ConfigurationTabProps = {
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const ConfigurationTab = ({ context, parentWorkflowId }: ConfigurationTabProps) => {
  const id = useWorkflowConfigId();
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(id);
  const isChainedWorkflow = !!parentWorkflowId;

  // Cross-file: definition (envs, stack/machine) lives in another module, so show disabled stand-ins; only instance-level pipeline conditions stay editable.
  const { isCrossFile, definingPath } = useCrossFileEntity('workflows', id);

  const showStackAndMachine = RuntimeUtils.isWebsiteMode() && !isUtilityWorkflow;

  return (
    <Box display="flex" flexDir="column" gap="16">
      {context === 'pipeline' && !isChainedWorkflow && <PipelineConditionsCard />}
      {showStackAndMachine &&
        (isCrossFile ? (
          <CrossFileDefinitionCard title="Stack & Machine" definingPath={definingPath} />
        ) : (
          <StackAndMachineCard />
        ))}
      {isCrossFile ? <CrossFileDefinitionCard title="Env Vars" definingPath={definingPath} /> : <EnvVarsCard />}
    </Box>
  );
};

export default ConfigurationTab;
