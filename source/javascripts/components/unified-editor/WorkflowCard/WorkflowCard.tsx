import { Box, Card, CardProps, Collapse, ControlButton, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { memo, PropsWithChildren, ReactNode, useMemo, useRef, useState } from 'react';

import { crossFileProvenanceLabel } from '@/components/CrossFileProvenanceText';
import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import PipelineService from '@/core/services/PipelineService';
import { useCrossFileEntity, useIsMergedConfigSelected, useIsReadOnlyView } from '@/hooks/useTree';
import useWorkflow from '@/hooks/useWorkflow';
import useWorkflowStackName from '@/hooks/useWorkflowStackName';

import WorkflowEmptyState from '../WorkflowEmptyState';
import ChainedWorkflowList from './components/ChainedWorkflowList';
import SortableWorkflowsContext from './components/SortableWorkflowsContext';
import WorkflowStepList from './components/WorkflowStepList';
import { useSelection, useWorkflowActions, WorkflowCardContextProvider } from './contexts/WorkflowCardContext';
import { SelectionParent, StepActions, WorkflowActions } from './WorkflowCard.types';

type ContentProps = {
  id: string;
  uses?: string;
  parallel?: string | number;
  isCollapsable?: boolean;
  containerProps?: CardProps;
};

const WorkflowName = ({ parallel, children }: PropsWithChildren<Pick<ContentProps, 'parallel'>>) => {
  const shouldDisplayAsParallelWorkflow = Boolean(parallel);

  if (!shouldDisplayAsParallelWorkflow) {
    return (
      <Text textStyle="body/md/semibold" hasEllipsis>
        {children}
      </Text>
    );
  }

  let badgeContent = parallel;
  let tooltipLabel = `${parallel} parallel copies` as ReactNode;
  let tooltipAriaLabel = `${parallel} parallel copies`;

  if (!PipelineService.isIntegerValue(parallel)) {
    badgeContent = '$';
    tooltipLabel = (
      <>
        Number of copies is calculated based on <strong>{parallel}</strong> Env Var.
      </>
    );
    tooltipAriaLabel = `Number of copies is calculated based on ${parallel} Env Var.`;
  }

  return (
    <Box display="flex" minW={0} maxW="100%" gap="4" alignItems="center">
      <Text textStyle="body/md/semibold" hasEllipsis>
        {children}
      </Text>
      <Tooltip shouldWrapChildren label={tooltipLabel} aria-label={tooltipAriaLabel}>
        <Text color="text/secondary" textStyle="comp/badge/sm" bg="sys/neutral/subtle" px="4" borderRadius="4">
          {badgeContent}
        </Text>
      </Tooltip>
    </Box>
  );
};

const WorkflowCardContent = memo(function WorkflowCardContent({
  id,
  uses,
  parallel,
  isCollapsable,
  containerProps,
}: ContentProps) {
  const workflowId = uses || id;

  const containerRef = useRef(null);
  const workflow = useWorkflow(workflowId, (s) => (s ? { title: s?.userValues?.title } : undefined));
  const stackName = useWorkflowStackName(workflowId);

  // Cross-file: workflow defined in another module, so render only the reference (no steps/chains); card stays clickable for instance-level props.
  const { isCrossFile, hasDefinition, definingPath } = useCrossFileEntity('workflows', workflowId);
  const isReadOnlyView = useIsReadOnlyView();
  const isMergedView = useIsMergedConfigSelected();
  // In the merged view every workflow resolves locally, but its definition still lives in a module — offer a jump.
  const showJumpButton = isCrossFile || (isMergedView && hasDefinition);

  const { isOpen, onOpen, onToggle } = useDisclosure({
    defaultIsOpen: !isCollapsable,
  });
  const { onCreateWorkflow, onChainWorkflow, onEditWorkflow, onRemoveWorkflow } = useWorkflowActions();

  const [isJumpPopoverOpen, setIsJumpPopoverOpen] = useState(false);

  const { isSelected } = useSelection();
  const isHighlighted = isSelected({ workflowId: id });
  const cardProps = useMemo(
    () => ({
      ...containerProps,
      // Ghost (read-only) tint: cross-file references, and every card in a read-only view.
      ...(isCrossFile || isReadOnlyView ? { backgroundColor: 'background/secondary' } : {}),
      ...(isHighlighted
        ? {
            outline: '2px solid',
            outlineColor: 'border/selected',
          }
        : {}),
    }),
    [containerProps, isHighlighted, isCrossFile, isReadOnlyView],
  );

  if (!workflow && !isCrossFile) {
    return <WorkflowEmptyState onCreateWorkflow={() => onCreateWorkflow?.()} />;
  }

  let subtitle = stackName;
  if (uses) {
    subtitle = `Uses ${uses}`;
  } else if (isCrossFile) {
    subtitle = crossFileProvenanceLabel(definingPath);
  }

  return (
    <Card minW={0} borderRadius="8" variant="elevated" {...cardProps}>
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
        {isCollapsable && (
          <ControlButton
            size="xs"
            isDisabled={isCrossFile}
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} Workflow details`}
            tooltipProps={{
              'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Workflow details`,
            }}
          />
        )}

        <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
          <WorkflowName parallel={parallel}>{uses ? id : workflow?.title || id}</WorkflowName>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {subtitle}
          </Text>
        </Box>

        {(onChainWorkflow || onEditWorkflow || onRemoveWorkflow || showJumpButton) && (
          <Box display={isJumpPopoverOpen ? 'inline-flex' : 'none'} _groupHover={{ display: 'inline-flex' }}>
            {/* Chaining writes into the definition, which is in another file for a cross-file reference — so hidden there. */}
            {onChainWorkflow && !isCrossFile && (
              <ControlButton
                size="xs"
                iconName="Link"
                aria-label="Chain Workflows"
                tooltipProps={{ 'aria-label': 'Chain Workflows' }}
                onClick={() => {
                  onOpen();
                  onChainWorkflow(id);
                }}
              />
            )}
            {onEditWorkflow && (
              <ControlButton
                size="xs"
                iconName="Settings"
                aria-label="Edit Workflow"
                tooltipProps={{ 'aria-label': 'Edit Workflow' }}
                onClick={() => onEditWorkflow(id)}
              />
            )}
            {showJumpButton && (
              <CrossFileJumpButton kind="workflows" id={workflowId} onOpenChange={setIsJumpPopoverOpen} />
            )}
            {onRemoveWorkflow && (
              <ControlButton
                isDanger
                size="xs"
                iconName="Trash"
                aria-label="Remove Workflow"
                tooltipProps={{ 'aria-label': 'Remove Workflow' }}
                onClick={() => onRemoveWorkflow(id)}
              />
            )}
          </Box>
        )}
      </Box>

      {!isCrossFile && (
        <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
          <SortableWorkflowsContext containerRef={containerRef}>
            <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
              <ChainedWorkflowList
                key={`${workflowId}->before_run`}
                placement="before_run"
                parentWorkflowId={workflowId}
              />
              <WorkflowStepList workflowId={workflowId} />
              <ChainedWorkflowList
                key={`${workflowId}->after_run`}
                placement="after_run"
                parentWorkflowId={workflowId}
              />
            </Box>
          </SortableWorkflowsContext>
        </Collapse>
      )}
    </Card>
  );
});

type Selection = {
  selectedStepIndices?: number[];
  selectionParent?: SelectionParent;
};
type Props = ContentProps & WorkflowActions & StepActions & Selection;

const WorkflowCard = ({
  id,
  uses,
  parallel,
  isCollapsable,
  containerProps,
  selectedStepIndices = [],
  selectionParent,
  ...actions
}: Props) => (
  <WorkflowCardContextProvider selectedStepIndices={selectedStepIndices} selectionParent={selectionParent} {...actions}>
    <WorkflowCardContent
      id={id}
      uses={uses}
      parallel={parallel}
      isCollapsable={isCollapsable}
      containerProps={containerProps}
    />
  </WorkflowCardContextProvider>
);

export default memo(WorkflowCard);
