import { Tooltip } from '@bitrise/bitkit';
import { BitkitButton, BitkitEmptyState, IconPlus, IconSparkleFilled, IconWorkflow } from '@bitrise/bitkit-v2';
import { ButtonGroup } from '@chakra-ui/react/button';

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
        <ButtonGroup gap="24">
          {isAIButtonVisible && (
            <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel}>
              <BitkitButton
                state={isAIButtonDisabled ? 'disabled' : undefined}
                icon={IconSparkleFilled}
                size="md"
                variant="ai-primary"
                onClick={onAIButtonClick}
              >
                Create Workflow with AI
              </BitkitButton>
            </Tooltip>
          )}
          <BitkitButton icon={IconPlus} size="md" onClick={onCreateWorkflow} variant="secondary">
            Create Workflow manually
          </BitkitButton>
        </ButtonGroup>
      )}
    </BitkitEmptyState>
  );
};

export default WorkflowEmptyState;
