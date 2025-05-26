import { Box, Card, CardProps, Collapse, ControlButton, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { memo, PropsWithChildren, ReactNode, useMemo, useRef } from 'react';

import PipelineService from '@/core/services/PipelineService';
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

const WorkflowCardContent = memo(({ id, uses, parallel, isCollapsable, containerProps }: ContentProps) => {
  const workflowId = uses || id;

  const containerRef = useRef(null);
  const workflow = useWorkflow(workflowId, (s) => (s ? { title: s?.userValues?.title } : undefined));
  const stackName = useWorkflowStackName(workflowId);

  const { isOpen, onOpen, onToggle } = useDisclosure({
    defaultIsOpen: !isCollapsable,
  });
  const { onCreateWorkflow, onChainWorkflow, onEditWorkflow, onRemoveWorkflow } = useWorkflowActions();

  const { isSelected } = useSelection();
  const isHighlighted = isSelected({ workflowId: id });
  const cardProps = useMemo(
    () => ({
      ...containerProps,
      ...(isHighlighted
        ? {
            outline: '2px solid',
            outlineColor: 'border/selected',
          }
        : {}),
    }),
    [containerProps, isHighlighted],
  );

  if (!workflow) {
    return <WorkflowEmptyState onCreateWorkflow={() => onCreateWorkflow?.()} />;
  }

  return (
    <Card minW={0} borderRadius="8" variant="elevated" {...cardProps}>
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
        {isCollapsable && (
          <ControlButton
            size="xs"
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
          <WorkflowName parallel={parallel}>{uses ? id : workflow.title || id}</WorkflowName>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {uses ? `Uses ${uses}` : stackName}
          </Text>
        </Box>

        {(onChainWorkflow || onEditWorkflow || onRemoveWorkflow) && (
          <Box display="none" _groupHover={{ display: 'inline-flex' }}>
            {onChainWorkflow && (
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

      <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
        <SortableWorkflowsContext containerRef={containerRef}>
          <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
            <ChainedWorkflowList
              key={`${workflowId}->before_run`}
              placement="before_run"
              parentWorkflowId={workflowId}
            />
            <WorkflowStepList workflowId={workflowId} />
            <ChainedWorkflowList key={`${workflowId}->after_run`} placement="after_run" parentWorkflowId={workflowId} />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
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
