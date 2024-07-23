import { Text } from '@bitrise/bitkit';
import useWorkflowUsedBy from '@/pages/WorkflowsPage/hooks/useWorkflowUsedBy';

const getUsedByText = (usedBy: string[]) => {
  switch (usedBy.length) {
    case 0:
      return 'Not used by other Workflow';
    case 1:
      return 'Used by 1 Workflow';
    default:
      return `Used by ${usedBy.length.toString()} Workflows`;
  }
};

type Props = {
  id: string;
};

const WorkflowUsedByText = ({ id }: Props) => {
  const usedBy = useWorkflowUsedBy({ id });

  return (
    <Text textStyle="body/sm/regular" color="text/secondary">
      {getUsedByText(usedBy)}
    </Text>
  );
};

export default WorkflowUsedByText;
