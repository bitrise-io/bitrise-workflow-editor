import { Button, ButtonGroup, EmptyState } from '@bitrise/bitkit';

type Props = {
  isAIButtonDisabled?: boolean;
  onCreateWorkflow: () => void;
  onCreateWorkflowWithAI?: () => void;
};

const WorkflowEmptyState = ({ isAIButtonDisabled, onCreateWorkflow, onCreateWorkflowWithAI }: Props) => (
  <EmptyState
    iconName="Workflow"
    title="Your Workflow will appear here"
    description="It looks like you haven't set up any Workflows. Create your first Workflow to automate your CI/CD pipeline."
  >
    <ButtonGroup spacing="0" gap="24">
      {onCreateWorkflowWithAI && (
        <Button
          isDisabled={isAIButtonDisabled}
          leftIconName="SparkleFilled"
          size="md"
          variant="ai-primary"
          onClick={onCreateWorkflowWithAI}
        >
          Create Workflow with AI
        </Button>
      )}
      <Button leftIconName="Plus" size="md" onClick={onCreateWorkflow} variant="secondary">
        Create Workflow manually
      </Button>
    </ButtonGroup>
  </EmptyState>
);

export default WorkflowEmptyState;
