import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useWorkflow from '@/hooks/useWorkflow';

type Props = {
  workflowId: string;
  orientation?: 'horizontal' | 'vertical';
};

const WorkflowStackAndMachine = ({ workflowId, orientation = 'vertical' }: Props) => {
  const workflow = useWorkflow(workflowId);
  const stackId = workflow?.userValues.meta?.['bitrise.io']?.stack || '';
  const machineTypeId = workflow?.userValues.meta?.['bitrise.io']?.machine_type_id || '';

  return (
    <StackAndMachine
      orientation={orientation}
      stackId={stackId}
      machineTypeId={machineTypeId}
      onChange={(s, m) => {
        console.log(`Set stack and machine type for workflow: ${workflowId}`, {
          stackId: s,
          machineTypeId: m,
        });
      }}
    />
  );
};

export default WorkflowStackAndMachine;
