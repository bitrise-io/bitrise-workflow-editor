import { Tab, TabList } from '@bitrise/bitkit';
import { BitkitButton, BitkitHeading, IconSparkleFilled } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import LabelTooltip from '@/components/LabelTooltip';
import WorkflowService from '@/core/services/WorkflowService';
import useAIButton from '@/hooks/useAIButton';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useCrossFileEntity, useIsMergedConfigSelected, useOtherDefiningModules } from '@/hooks/useTree';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { useWorkflowConfigContext, useWorkflowConfigId } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  withExplain?: boolean;
  context: 'pipeline' | 'workflow';
  parentWorkflowId?: string;
};

const WorkflowConfigHeader = ({ variant, context, parentWorkflowId, withExplain = variant === 'panel' }: Props) => {
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
      <Box
        display="flex"
        alignItems="center"
        gap="16"
        paddingBlockStart={variant === 'panel' ? '24' : '0'}
        paddingInline={variant === 'panel' ? '24' : '0'}
      >
        <div>
          <BitkitHeading as="h3">{title || id || 'Workflow'}</BitkitHeading>
          {showSubTitle && !isCrossFile && (
            <Text textStyle="body/md/regular" color="text/secondary">
              {WorkflowService.getUsedByText(dependants)}
            </Text>
          )}
          {showDefinitionLink && (
            <Text textStyle="body/md/regular" color="text/secondary">
              <EntityModuleProvenance
                kind="workflows"
                id={id}
                pathTextStyle="body/md/semibold"
                fallback={<JumpToDefinitionLink kind="workflows" id={id} />}
              />
            </Text>
          )}
        </div>
        {isAIButtonVisible && withExplain && (
          <LabelTooltip text={tooltipLabel ?? ''} disabled={!tooltipLabel}>
            <BitkitButton
              state={isAIButtonDisabled ? 'disabled' : undefined}
              icon={IconSparkleFilled}
              size="sm"
              variant="ai-secondary"
              onClick={onAIButtonClick}
            >
              Explain
            </BitkitButton>
          </LabelTooltip>
        )}
      </Box>
      <TabList paddingX="8" mx={variant === 'drawer' ? '-24' : '0'} mt="16" data-clarity-unmask="true">
        <Tab>Configuration</Tab>
        <Tab isDisabled={isCrossFile}>Properties</Tab>
        {shouldShowTriggersTab && <Tab isDisabled={isCrossFile}>Triggers</Tab>}
      </TabList>
    </>
  );
};

export default WorkflowConfigHeader;
