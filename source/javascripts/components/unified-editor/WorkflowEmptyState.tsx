import { Button, ButtonGroup, Tooltip } from '@bitrise/bitkit';
import { BitkitEmptyState, IconWorkflow } from '@bitrise/bitkit-v2';

import useAIButton from '@/hooks/useAIButton';
import { useIsReadOnlyView } from '@/hooks/useTree';

type Props = {
  onCreateWorkflow: () => void;
};

const WorkflowEmptyState = ({ onCreateWorkflow }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();
  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({
    action: 'create_workflow',
    source: 'workflow_empty_state',
    yamlSelector: 'workflows',
  });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  return (
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconWorkflow}
      headingText="Your Workflow will appear here"
      bodyText="It looks like you haven't set up any Workflows. Create your first Workflow to automate your CI/CD pipeline."
    >
      {/* Read-only views (merged config, cross-repo/ref files) can't create — show no actions. */}
      {!isReadOnlyView && (
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
      )}
    </BitkitEmptyState>
  );
};

export default WorkflowEmptyState;
