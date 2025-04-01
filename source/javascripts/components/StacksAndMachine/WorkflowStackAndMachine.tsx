import { Card } from '@bitrise/bitkit';
import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

type Props = {
  workflowId: string;
};

const WorkflowStackAndMachine = ({ workflowId }: Props) => {
  const { stackId, machineTypeId } = useWorkflowStackAndMachine(workflowId);
  const updateWorkflowMeta = useBitriseYmlStore((s) => s.updateWorkflowMeta);

  return (
    <StackAndMachine
      as={Card}
      stackId={stackId}
      machineTypeId={machineTypeId}
      onChange={(stack, machine_type_id) => {
        updateWorkflowMeta(workflowId, {
          stack,
          machine_type_id,
        });
      }}
    />
  );
};

export default WorkflowStackAndMachine;
