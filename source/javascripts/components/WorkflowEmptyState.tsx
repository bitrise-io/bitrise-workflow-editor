import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onAddWorkflow: () => void;
};

const WorkflowEmptyState = ({ onAddWorkflow }: Props) => (
  <EmptyState
    iconName="Workflow"
    title="Your journey starts here"
    description="Add your first workflow and start utilizing the power of CI"
  >
    <Button variant="secondary" onClick={onAddWorkflow}>
      Add Workflow
    </Button>
  </EmptyState>
);

export default WorkflowEmptyState;
