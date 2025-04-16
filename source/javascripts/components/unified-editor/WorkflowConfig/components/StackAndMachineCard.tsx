import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';
import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const StackAndMachineCard = () => {
  const workflow = useWorkflowConfigContext();
  const workflowId = workflow?.id || '';
  const { stackId, machineTypeId, stackRollbackVersion } = useWorkflowStackAndMachine(workflowId);

  const updateWorkflowMeta = useBitriseYmlStore((s) => s.updateWorkflowMeta);

  return (
    <StackAndMachine
      isExpandable
      stackId={stackId}
      machineTypeId={machineTypeId}
      onChange={(stack, machine_type_id, stack_rollback_version) => {
        updateWorkflowMeta(workflowId, {
          stack,
          machine_type_id,
          stack_rollback_version,
        });
      }}
      stackRollbackVersion={stackRollbackVersion}
    />
  );
};

export default StackAndMachineCard;
