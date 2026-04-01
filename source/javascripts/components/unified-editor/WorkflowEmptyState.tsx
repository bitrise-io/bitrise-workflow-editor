import { Button, ButtonGroup, EmptyState, Tooltip } from '@bitrise/bitkit';

import useAIButton from '@/hooks/useAIButton';

type Props = {
  onCreateWorkflow: () => void;
};

const WorkflowEmptyState = ({ onCreateWorkflow }: Props) => {
  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({ action: 'create_workflow', yamlSelector: 'workflows' });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  return (
    <EmptyState
      iconName="Workflow"
      title="Your Workflow will appear here"
      description="It looks like you haven't set up any Workflows. Create your first Workflow to automate your CI/CD pipeline."
    >
      <ButtonGroup spacing="0" gap="24">
        {isAIButtonVisible && (
          <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel}>
            <Button
              isDisabled={isAIButtonDisabled}
              leftIconName="SparkleFilled"
              size="md"
              variant="ai-primary"
              onClick={onAIButtonClick}
            >
              Create Workflow with AI
            </Button>
          </Tooltip>
        )}
        <Button leftIconName="Plus" size="md" onClick={onCreateWorkflow} variant="secondary">
          Create Workflow manually
        </Button>
      </ButtonGroup>
    </EmptyState>
  );
};

export default WorkflowEmptyState;
