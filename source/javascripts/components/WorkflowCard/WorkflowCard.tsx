import { Fragment } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import AddStepButton from './components/AddStepButton';
import useWorkflow from './hooks/useWorkflow';
import StepCard from '@/components/StepCard/StepCard';
import { Step } from '@/models/Step';
import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useWorkflowUsedBy from '@/pages/WorkflowsPage/hooks/useWorkflowUsedBy';

type StepEditCallback = (workflowId: string, stepIndex: number) => void;
type WorkflowEditCallback = (workflowId: string) => void;

type WorkflowCardProps = CardProps & {
  workflowId: string;
  parentWorkflowId?: string;
  chainedWorkflowIndex?: number;
  placement?: Placement;
  isFixed?: boolean;
  isExpanded?: boolean;
  isEditable?: boolean;
  onAddStep?: StepEditCallback;
  onSelectStep?: StepEditCallback;
  onChainWorkflow?: WorkflowEditCallback;
};

const getUsedByText = (usedBy: string[]) => {
  switch (usedBy.length) {
    case 0:
      return 'not used by other Workflow';
    case 1:
      return 'used by 1 Workflow';
    default:
      return `used by ${usedBy.length} Workflows`;
  }
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
  onSelectStep,
  onChainWorkflow,
  ...props
}: WorkflowCardProps) => {
  const workflow = useWorkflow(workflowId);
  const workflowUsedBy = useWorkflowUsedBy(workflowId);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });
  const deleteChainedWorkflow = useBitriseYmlStore(useShallow((s) => s.deleteChainedWorkflow));

  if (!workflow) {
    // TODO: Missing mpty state
    // eslint-disable-next-line no-console
    console.warn(`Workflow '${workflowId}' is not found in yml!`);
    return null;
  }

  const hasNoSteps = !workflow.steps?.length;
  const hasAfterRunWorkflows = Boolean(workflow.after_run?.length);
  const hasBeforeRunWorkflows = Boolean(workflow.before_run?.length);

  return (
    <Card variant={!parentWorkflowId ? 'elevated' : 'outline'} {...props}>
      <Box display="flex" alignItems="center" px="8" py="6" className="group">
        {!isFixed && (
          <ControlButton
            size="xs"
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

          {parentWorkflowId && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {placement}
              {' • '}
              {getUsedByText(workflowUsedBy)}
            </Text>
          )}

          {!parentWorkflowId && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {workflow.meta?.['bitrise.io']?.stack || 'Unknown stack'}
            </Text>
          )}
        </Box>
        {isEditable && (
          <ButtonGroup ml="4" display="none" _groupHover={{ display: 'flex' }}>
            <ControlButton
              size="xs"
              iconName="PlusOpen"
              onClick={() => onChainWorkflow?.(workflowId)}
              aria-label="Chain Workflows"
            />
            {chainedWorkflowIndex !== undefined && parentWorkflowId && placement && (
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
                onSelectStep={onSelectStep}
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

          {workflow.steps?.map((s, stepIndex, steps) => {
            const isLastStep = stepIndex === steps.length - 1;
            const [cvs = ''] = Object.entries(s)[0] as [string, Step];

            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`workflows[${workflowId}].steps[${stepIndex}][${cvs}]`}>
                {isEditable && <AddStepButton onClick={() => onAddStep?.(workflowId, stepIndex)} my={-8} />}
                <StepCard
                  workflowId={workflowId}
                  stepIndex={stepIndex}
                  onClick={onSelectStep && (() => onSelectStep(workflowId, stepIndex))}
                  showSecondary
                />
                {isEditable && isLastStep && (
                  <AddStepButton onClick={() => onAddStep?.(workflowId, stepIndex + 1)} my={-8} />
                )}
              </Fragment>
            );
          })}

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
                onSelectStep={onSelectStep}
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
