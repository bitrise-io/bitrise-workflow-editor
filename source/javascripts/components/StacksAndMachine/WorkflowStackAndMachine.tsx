import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

type Props = {
  workflowId: string;
};

const WorkflowStackAndMachine = ({ workflowId }: Props) => {
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
      stackId={stackId}
      machineTypeId={machineTypeId}
      stackRollbackVersion={stackRollbackVersion}
      onChange={updateWorkflowMeta}
    />
  );
};

export default WorkflowStackAndMachine;
