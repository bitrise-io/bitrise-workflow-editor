import { Button, ButtonGroup, EmptyState } from '@bitrise/bitkit';
import { Tooltip } from 'chakra-ui-2--react';

import useAIButton from '@/components/unified-editor/ContainersTab/hooks/useAIButton';

type Props = {
  isAIButtonDisabled?: boolean;
  onCreateWorkflow: () => void;
};

const WorkflowEmptyState = ({ onCreateWorkflow }: Props) => {
  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({ selectedPage: 'workflows', yamlSelector: 'workflow' });
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
