import { Fragment } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import StepCard from '@/components/StepCard/StepCard';
import { Step } from '@/models/Step';
import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflowUsedBy from '@/pages/WorkflowsPage/hooks/useWorkflowUsedBy';
import useWorkflow from './hooks/useWorkflow';
import AddStepButton from './components/AddStepButton';
import { getSortableStepId, getUsedByText, parseSortableStepId } from './WorkflowCard.utils';

type StepEditCallback = (workflowId: string, stepIndex: number) => void;
type WorkflowEditCallback = (workflowId: string) => void;
type MoveStepCallback = (workflowId: string, stepIndex: number, to: number) => void;

type WorkflowCardProps = CardProps & {
  workflowId: string;
  parentWorkflowId?: string;
  chainedWorkflowIndex?: number;
  placement?: Placement;
  isFixed?: boolean;
  isExpanded?: boolean;
  isEditable?: boolean;
  onAddStep?: StepEditCallback;
  onMoveStep?: MoveStepCallback;
  onSelectStep?: StepEditCallback;
  onEditWorkflow?: WorkflowEditCallback;
  onChainWorkflow?: WorkflowEditCallback;
};

const WorkflowCard = ({
  workflowId,
  parentWorkflowId,
  chainedWorkflowIndex,
  placement,
  isFixed,
  isExpanded,
  isEditable,
  onAddStep,
  onMoveStep,
  onSelectStep,
  onEditWorkflow,
  onChainWorkflow,
  ...props
}: WorkflowCardProps) => {
  const workflow = useWorkflow(workflowId);
  const sensors = useSensors(useSensor(PointerSensor));
  const workflowUsedBy = useWorkflowUsedBy(workflowId);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });
  const deleteChainedWorkflow = useBitriseYmlStore(useShallow((s) => s.deleteChainedWorkflow));

  const sortableItemIdentifiers = (workflow?.steps ?? []).map((_, stepIndex) => {
    return getSortableStepId(workflowId, stepIndex);
  });

  const isRoot = !parentWorkflowId;
  const hasNoSteps = !workflow?.steps?.length;
  const hasAfterRunWorkflows = !!workflow?.after_run?.length;
  const hasBeforeRunWorkflows = !!workflow?.before_run?.length;

  const handleMoveStep = (e: DragEndEvent) => {
    const { stepIndex } = parseSortableStepId(e.active.id.toString());
    const { stepIndex: to } = parseSortableStepId(e.over?.id.toString() || '');
    onMoveStep?.(workflowId, stepIndex, to);
  };

  if (!workflow) {
    // TODO: Missing mpty state
    // eslint-disable-next-line no-console
    console.warn(`Workflow '${workflowId}' is not found in yml!`);
    return null;
  }

  return (
    <Card variant={isRoot ? 'elevated' : 'outline'} {...props}>
      <Box display="flex" alignItems="center" px="8" py="6" className="group">
        {!isFixed && (
          <ControlButton
            size="xs"
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} workflow details`}
          />
        )}
        <Box ml="4" display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
          <Text textStyle="body/md/semibold" hasEllipsis>
            {workflow.title || workflowId}
          </Text>

          {isRoot && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {workflow.meta?.['bitrise.io']?.stack || 'Unknown stack'}
            </Text>
          )}

          {!isRoot && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {placement}
              {' • '}
              {getUsedByText(workflowUsedBy)}
            </Text>
          )}
        </Box>
        {isEditable && (
          <ButtonGroup ml="4" spacing="0" display="none" _groupHover={{ display: 'flex' }}>
            <ControlButton
              size="xs"
              iconName="PlusOpen"
              aria-label="Chain Workflows"
              onClick={() => onChainWorkflow?.(workflowId)}
            />
            {!isRoot && (
              <ControlButton
                size="xs"
                display="none" // NOTE: It should be visibe after WorkflowConfigDrawer implemented.
                iconName="Settings"
                aria-label="Edit Workflow"
                onClick={() => onEditWorkflow?.(workflowId)}
              />
            )}
            {!isRoot && chainedWorkflowIndex !== undefined && placement && (
              <ControlButton
                size="xs"
                iconName="Trash"
                aria-label="Remove"
                onClick={() => deleteChainedWorkflow(chainedWorkflowIndex, parentWorkflowId, placement)}
              />
            )}
          </ButtonGroup>
        )}
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }} unmountOnExit={false}>
        <Box display="flex" flexDir="column" gap="8" p="8">
          {workflow.before_run?.map((chainedWorkflowId, i) => {
            return (
              <WorkflowCard
                // eslint-disable-next-line react/no-array-index-key
                key={`before_run:${chainedWorkflowId}(${i})->${workflowId}`}
                workflowId={chainedWorkflowId}
                parentWorkflowId={workflowId}
                chainedWorkflowIndex={i}
                placement="before_run"
                isEditable={isEditable}
                onAddStep={onAddStep}
                onMoveStep={onMoveStep}
                onSelectStep={onSelectStep}
                onEditWorkflow={onEditWorkflow}
                onChainWorkflow={onChainWorkflow}
              />
            );
          })}

          {hasBeforeRunWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}

          {hasNoSteps && (
            <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
              <Text textStyle="body/sm/regular" color="text/secondary">
                This Workflow is empty.
              </Text>
            </Card>
          )}

          <Box display="flex" flexDir="column" gap="8">
            <DndContext
              sensors={sensors}
              onDragEnd={handleMoveStep}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={sortableItemIdentifiers} strategy={verticalListSortingStrategy}>
                {workflow?.steps?.map((s, stepIndex, steps) => {
                  const isLastStep = stepIndex === steps.length - 1;
                  const [cvs = ''] = Object.entries(s)[0] as [string, Step];

                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={`workflows[${workflowId}].steps[${stepIndex}][${cvs}]`}>
                      {isEditable && <AddStepButton onClick={() => onAddStep?.(workflowId, stepIndex)} my={-8} />}

                      <StepCard
                        showSecondary
                        stepIndex={stepIndex}
                        workflowId={workflowId}
                        isDraggable={isEditable && !!onMoveStep}
                        onClick={onSelectStep && (() => onSelectStep(workflowId, stepIndex))}
                      />

                      {isEditable && isLastStep && (
                        <AddStepButton onClick={() => onAddStep?.(workflowId, stepIndex + 1)} my={-8} />
                      )}
                    </Fragment>
                  );
                })}
              </SortableContext>
            </DndContext>
          </Box>

          {hasAfterRunWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}

          {workflow.after_run?.map((chainedWorkflowId, i) => {
            return (
              <WorkflowCard
                // eslint-disable-next-line react/no-array-index-key
                key={`after_run:${workflowId}->${chainedWorkflowId}(${i})`}
                workflowId={chainedWorkflowId}
                parentWorkflowId={workflowId}
                chainedWorkflowIndex={i}
                placement="after_run"
                isEditable={isEditable}
                onAddStep={onAddStep}
                onMoveStep={onMoveStep}
                onSelectStep={onSelectStep}
                onEditWorkflow={onEditWorkflow}
                onChainWorkflow={onChainWorkflow}
              />
            );
          })}
        </Box>
      </Collapse>
    </Card>
  );
};

export default WorkflowCard;
