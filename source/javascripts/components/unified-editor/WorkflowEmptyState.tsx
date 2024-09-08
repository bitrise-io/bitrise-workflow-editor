import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onCreateWorkflow: () => void;
};

const WorkflowEmptyState = ({ onCreateWorkflow }: Props) => (
  <EmptyState
    iconName="Workflow"
    title="Your Workflows will appear here"
    description="It looks like you haven't set up any Workflows. Create your first Workflow to automate your CI/CD pipeline."
  >
    <Button leftIconName="PlusAdd" variant="secondary" onClick={onCreateWorkflow}>
      Create Workflow
    </Button>
  </EmptyState>
);

export default WorkflowEmptyState;
