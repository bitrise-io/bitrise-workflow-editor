import { Box, Button, Link, Tab, TabList, Text, Tooltip } from '@bitrise/bitkit';

import EntityIndexService from '@/core/services/EntityIndexService';
import WorkflowService from '@/core/services/WorkflowService';
import useAIButton from '@/hooks/useAIButton';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import { useIsMergedConfigSelected } from '@/hooks/useTree';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { useWorkflowConfigContext, useWorkflowConfigId } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const WorkflowConfigHeader = ({ variant, context, parentWorkflowId }: Props) => {
  // Raw id resolves even for a cross-file workflow; the resolved context title
  // is undefined there (no local definition), which is fine for display.
  const id = useWorkflowConfigId();
  const title = useWorkflowConfigContext((s) => s?.userValues?.title);

  const dependants = useDependantWorkflows({ workflowId: id });
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();

  // The workflow's definition may live in another module file (cross-file
  // reference). Here we only edit the instance-level config (Configuration tab);
  // the definition-level tabs (Properties, Triggers) belong to the defining file,
  // so they're shown but disabled, with a jump-to-definition link offered
  // instead. In single-file mode the index is empty, so this is always false.
  const isLocal = useBitriseYmlStore(({ yml }) => Boolean(yml.workflows?.[id]));
  const isCrossFile = !isLocal && Boolean(EntityIndexService.definingNodeId(entityIndex, 'workflows', id));

  // On the merged view every workflow resolves locally, so `isCrossFile` is
  // false — but the definition still lives in a specific module. Offer a jump to
  // it (the read-only merged preview isn't where you edit).
  const isMergedView = useIsMergedConfigSelected();
  const canJumpToDefinition = isMergedView && Boolean(EntityIndexService.definingNodeId(entityIndex, 'workflows', id));
  const showDefinitionLink = isCrossFile || canJumpToDefinition;

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
          {showDefinitionLink && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              {isCrossFile && 'Defined in another file • '}
              <Link as="button" colorScheme="purple" onClick={() => jumpToDefinition('workflows', id)}>
                {isMergedView ? 'Go to definition' : 'Edit definition'}
              </Link>
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
