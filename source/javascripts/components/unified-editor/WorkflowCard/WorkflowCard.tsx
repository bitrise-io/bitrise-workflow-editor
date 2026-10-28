import { Collapse, Tooltip } from '@bitrise/bitkit';
import {
  BitkitControlButton,
  IconChevronDown,
  IconChevronUp,
  IconLink,
  IconSettings,
  IconTrash,
} from '@bitrise/bitkit-v2';
import { Badge } from '@chakra-ui/react/badge';
import { Box } from '@chakra-ui/react/box';
import { Card, CardRootProps } from '@chakra-ui/react/card';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { memo, PropsWithChildren, ReactNode, useMemo, useRef, useState } from 'react';

import { otherModulesLabel } from '@/components/EntityModuleProvenance';
import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import PipelineService from '@/core/services/PipelineService';
import {
  useCrossFileEntity,
  useIsMergedConfigSelected,
  useIsReadOnlyView,
  useOtherDefiningModules,
} from '@/hooks/useTree';
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
  containerProps?: CardRootProps;
};

const WorkflowName = ({ parallel, children }: PropsWithChildren<Pick<ContentProps, 'parallel'>>) => {
  const shouldDisplayAsParallelWorkflow = Boolean(parallel);

  if (!shouldDisplayAsParallelWorkflow) {
    return (
      <Text textStyle="body/md/semibold" truncate maxWidth="full">
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
    <Box display="flex" minWidth="0" maxWidth="100%" gap="4" alignItems="center">
      <Text textStyle="body/md/semibold" truncate maxWidth="full">
        {children}
      </Text>
      <Tooltip shouldWrapChildren label={tooltipLabel} aria-label={tooltipAriaLabel}>
        {/* Not BitkitBadge: even its xs size makes the card header taller. The overrides shrink the
            Bitkit badge recipe to fit the title line, and display="flex" stops it sinking to the
            bottom of the line inside the Tooltip's wrapper span. */}
        <Badge display="flex" minWidth="0" paddingBlock="0" paddingInline="4">
          {badgeContent}
        </Badge>
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

  const { isCrossFile, hasDefinition } = useCrossFileEntity('workflows', workflowId);
  const otherModules = useOtherDefiningModules('workflows', workflowId);
  const isReadOnlyView = useIsReadOnlyView();
  const isMergedView = useIsMergedConfigSelected();
  const showJumpButton = otherModules.nodeIds.length > 0 || (isMergedView && hasDefinition);
  const isGhost = isCrossFile || isReadOnlyView;

  const {
    open: isOpen,
    onOpen,
    onToggle,
  } = useDisclosure({
    defaultOpen: !isCollapsable,
  });
  const { onCreateWorkflow, onChainWorkflow, onEditWorkflow, onRemoveWorkflow } = useWorkflowActions();

  const [isJumpPopoverOpen, setIsJumpPopoverOpen] = useState(false);

  const { isSelected } = useSelection();
  const isHighlighted = isSelected({ workflowId: id });
  const cardProps = useMemo(
    () => ({
      ...containerProps,
      ...(isGhost && { opacity: 0.7 }),
      ...(isHighlighted
        ? {
            outline: '2px solid',
            outlineColor: 'border/selected',
          }
        : {}),
    }),
    [containerProps, isGhost, isHighlighted],
  );

  if (!workflow && !isCrossFile) {
    return <WorkflowEmptyState onCreateWorkflow={() => onCreateWorkflow?.()} />;
  }

  let subtitle = stackName;
  if (otherModules.nodeIds.length > 0) {
    subtitle = otherModulesLabel(otherModules);
  }
  if (uses) {
    subtitle = `Uses ${uses}`;
  }

  return (
    <Card.Root minWidth="0" width="full" {...cardProps}>
      <Box display="flex" alignItems="center" paddingInline="8" paddingBlock="6" gap="4" className="group">
        {/* No expand/collapse for cross-file refs — their nested content lives in another file
            and isn't shown here, so the chevron is hidden rather than rendered disabled. */}
        {isCollapsable && !isCrossFile && (
          <BitkitControlButton
            size="xs"
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            icon={isOpen ? IconChevronUp : IconChevronDown}
            label={`${isOpen ? 'Collapse' : 'Expand'} Workflow details`}
          />
        )}

        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          flex="1"
          minWidth="0"
        >
          <WorkflowName parallel={parallel}>{uses ? id : workflow?.title || id}</WorkflowName>
          <Text textStyle="body/sm/regular" color="text/secondary" truncate maxWidth="full">
            {subtitle}
          </Text>
        </Box>

        {(onChainWorkflow || onEditWorkflow || onRemoveWorkflow || showJumpButton) && (
          <Box display={isJumpPopoverOpen ? 'inline-flex' : 'none'} _groupHover={{ display: 'inline-flex' }}>
            {/* Chaining writes into the definition — hidden for cross-file refs (another file). */}
            {onChainWorkflow && !isCrossFile && (
              <BitkitControlButton
                size="xs"
                icon={IconLink}
                label="Chain Workflows"
                onClick={() => {
                  onOpen();
                  onChainWorkflow(id);
                }}
              />
            )}
            {/* Jump takes the leading "primary action" slot for ghosts (where Chain is hidden),
                matching the design's referenced-WF actions: jump → settings → remove. */}
            {showJumpButton && (
              // The picker lists every defining module (incl. the current one) so both occurrences of
              // a workflow defined here and elsewhere are reachable.
              <CrossFileJumpButton kind="workflows" id={workflowId} onOpenChange={setIsJumpPopoverOpen} />
            )}
            {onEditWorkflow && (
              <BitkitControlButton
                size="xs"
                icon={IconSettings}
                label="Edit Workflow"
                onClick={() => onEditWorkflow(id)}
              />
            )}
            {onRemoveWorkflow && (
              <BitkitControlButton
                isDanger
                size="xs"
                icon={IconTrash}
                label="Remove Workflow"
                onClick={() => onRemoveWorkflow(id)}
              />
            )}
          </Box>
        )}
      </Box>

      {!isCrossFile && (
        <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
          <SortableWorkflowsContext containerRef={containerRef}>
            <Box display="flex" flexDirection="column" gap="8" padding="8" ref={containerRef}>
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
    </Card.Root>
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
