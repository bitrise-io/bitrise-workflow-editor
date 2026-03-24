import { Box, Button, Tab, TabList, Text, Tooltip } from '@bitrise/bitkit';

import useAIButton from '@/components/unified-editor/ContainersTab/hooks/useAIButton';
import WorkflowService from '@/core/services/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';

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

  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({ selectedPage: 'workflows', yamlSelector: `workflows.${id}` });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  return (
    <>
      <Box display="flex" gap="16" p={variant === 'panel' ? '24px 24px 0px 24px' : '0'}>
        <Box>
          <Text as="h3" textStyle="heading/h3">
            {title || id || 'Workflow'}
          </Text>
          {showSubTitle && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              {WorkflowService.getUsedByText(dependants)}
            </Text>
          )}
        </Box>
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
