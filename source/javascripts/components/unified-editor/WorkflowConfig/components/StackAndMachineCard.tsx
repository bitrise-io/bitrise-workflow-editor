import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const StackAndMachineCard = () => {
  const workflow = useWorkflowConfigContext();
  const workflowId = workflow?.id || '';
  const { stackId, machineTypeId, stackRollbackVersion } = useWorkflowStackAndMachine(workflowId);

  const updateWorkflowMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    StackAndMachineService.updateStackId(stack, StackAndMachineSource.Workflow, workflowId);
    StackAndMachineService.updateMachineTypeId(machine_type_id, StackAndMachineSource.Workflow, workflowId);
    StackAndMachineService.updateStackRollbackVersion(
      stack_rollback_version,
      StackAndMachineSource.Workflow,
      workflowId,
    );
  };

  return (
    <StackAndMachine
      isExpandable
      stackId={stackId}
      machineTypeId={machineTypeId}
      stackRollbackVersion={stackRollbackVersion}
      onChange={updateWorkflowMeta}
    />
  );
};

export default StackAndMachineCard;
