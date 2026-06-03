import { Box, Button, Tab, TabList, Text, Tooltip } from '@bitrise/bitkit';

import WorkflowService from '@/core/services/WorkflowService';
import useAIButton from '@/hooks/useAIButton';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const WorkflowConfigHeader = ({ variant, context, parentWorkflowId }: Props) => {
  const { id, title } = useWorkflowConfigContext((s) => ({
    id: s?.id || '',
    title: s?.userValues?.title,
  }));

  const dependants = useDependantWorkflows({ workflowId: id });

  const showSubTitle = context === 'workflow';
  const shouldShowTriggersTab = !parentWorkflowId && !WorkflowService.isUtilityWorkflow(id) && context === 'workflow';

  const pipelineId = usePipelinesPageStore((s) => s.pipelineId);
  const yamlSelector =
    context === 'pipeline' && pipelineId ? `pipelines.${pipelineId}.workflows.${id}` : `workflows.${id}`;

  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({
    action: 'explain_workflow',
    source: 'workflow_canvas',
    yamlSelector,
  });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  return (
    <>
      <Box display="flex" alignItems="center" gap="16" p={variant === 'panel' ? '24px 24px 0px 24px' : '0'}>
        <div>
          <Text as="h3" textStyle="heading/h3">
            {title || id || 'Workflow'}
          </Text>
          {showSubTitle && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              {WorkflowService.getUsedByText(dependants)}
            </Text>
          )}
        </div>
        {isAIButtonVisible && variant === 'panel' && (
          <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel}>
            <Button
              isDisabled={isAIButtonDisabled}
              leftIconName="SparkleFilled"
              size="sm"
              variant="ai-secondary"
              onClick={onAIButtonClick}
            >
              Explain
            </Button>
          </Tooltip>
        )}
      </Box>
      <TabList paddingX="8" mx={variant === 'drawer' ? '-24' : '0'} mt="16">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
        {shouldShowTriggersTab && <Tab>Triggers</Tab>}
      </TabList>
    </>
  );
};

export default WorkflowConfigHeader;
