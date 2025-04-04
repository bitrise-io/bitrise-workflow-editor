import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

type Props = {
  workflowId: string;
};

const WorkflowStackAndMachine = ({ workflowId }: Props) => {
  const { stackId, machineTypeId, stackRollbackVersion } = useWorkflowStackAndMachine(workflowId);
  const updateWorkflowMeta = useBitriseYmlStore((s) => s.updateWorkflowMeta);

  return (
    <StackAndMachine
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

export default WorkflowStackAndMachine;
