import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

type Props = {
  workflowId: string;
  orientation?: 'horizontal' | 'vertical';
};

const WorkflowStackAndMachine = ({ workflowId, orientation = 'vertical' }: Props) => {
  const { stackId, machineTypeId } = useWorkflowStackAndMachine({ workflowId });
  const updateWorkflowMeta = useBitriseYmlStore((s) => s.updateWorkflowMeta);

  return (
    <StackAndMachine
      orientation={orientation}
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
