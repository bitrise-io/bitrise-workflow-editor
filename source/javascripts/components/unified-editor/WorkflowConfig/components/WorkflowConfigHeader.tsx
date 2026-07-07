import { Box, Button, Tab, TabList, Text, Tooltip } from '@bitrise/bitkit';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import WorkflowService from '@/core/services/WorkflowService';
import useAIButton from '@/hooks/useAIButton';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useCrossFileEntity, useIsMergedConfigSelected, useOtherDefiningModules } from '@/hooks/useTree';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { useWorkflowConfigContext, useWorkflowConfigId } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const WorkflowConfigHeader = ({ variant, context, parentWorkflowId }: Props) => {
  const id = useWorkflowConfigId();
  const title = useWorkflowConfigContext((s) => s?.userValues?.title);

  const dependants = useDependantWorkflows({ workflowId: id });

  const { isCrossFile, hasDefinition } = useCrossFileEntity('workflows', id);
  const otherModules = useOtherDefiningModules('workflows', id);
  const isMergedView = useIsMergedConfigSelected();
  const showDefinitionLink = otherModules.nodeIds.length > 0 || (isMergedView && hasDefinition);

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
          {showSubTitle && !isCrossFile && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              {WorkflowService.getUsedByText(dependants)}
            </Text>
          )}
          {showDefinitionLink && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              <EntityModuleProvenance
                kind="workflows"
                id={id}
                fallback={<JumpToDefinitionLink kind="workflows" id={id} />}
              />
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
        <Tab isDisabled={isCrossFile}>Properties</Tab>
        {shouldShowTriggersTab && <Tab isDisabled={isCrossFile}>Triggers</Tab>}
      </TabList>
    </>
  );
};

export default WorkflowConfigHeader;
