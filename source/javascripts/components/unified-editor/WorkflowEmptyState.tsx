import { Button, ButtonGroup, EmptyState } from '@bitrise/bitkit';

type Props = {
  onCreateWorkflow: () => void;
  onCreateWorkflowWithAI?: () => void;
};

const WorkflowEmptyState = ({ onCreateWorkflow, onCreateWorkflowWithAI }: Props) => (
  <EmptyState
    iconName="Workflow"
    title="Your Workflow will appear here"
    description="It looks like you haven't set up any Workflows. Create your first Workflow to automate your CI/CD pipeline."
  >
    <ButtonGroup>
      <Button leftIconName="Plus" size="md" onClick={onCreateWorkflow}>
        Create Workflow
      </Button>
      {onCreateWorkflowWithAI && (
        <Button leftIconName="SparkleFilled" size="md" variant="ai-primary" onClick={onCreateWorkflowWithAI}>
          Create Workflow with AI
        </Button>
      )}
    </ButtonGroup>
  </EmptyState>
);

export default WorkflowEmptyState;
