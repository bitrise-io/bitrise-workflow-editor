import { Box } from '@bitrise/bitkit';

import EntityIndexService from '@/core/services/EntityIndexService';
import WorkflowService from '@/core/services/WorkflowService';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import { useDefiningFilePath } from '@/hooks/useTree';

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
  // Raw id (resolves even for a cross-file workflow, unlike the resolved context).
  const id = useWorkflowConfigId();
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(id);
  const isChainedWorkflow = !!parentWorkflowId;

  // The workflow's definition (its envs, stack/machine) lives in another module
  // file for a cross-file reference. The real cards read/edit a workflow absent
  // from this file and would throw, so a cross-file reference shows disabled,
  // grayed-out stand-ins pointing at the defining file instead. Only the
  // instance-level pipeline conditions remain editable. In single-file mode the
  // index is empty, so this is always false.
  const entityIndex = useEntityIndex();
  const isLocal = useBitriseYmlStore(({ yml }) => Boolean(yml.workflows?.[id]));
  const isCrossFile = !isLocal && Boolean(EntityIndexService.definingNodeId(entityIndex, 'workflows', id));
  const definingPath = useDefiningFilePath('workflows', id);

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
