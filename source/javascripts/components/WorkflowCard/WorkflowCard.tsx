import { Fragment } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { useAfterRunWorkflows, useBeforeRunWorkflows } from './hooks/useWorkflowChain';
import AddStepButton from './components/AddStepButton';
import useWorkflow from './hooks/useWorkflow';
import StepCard from '@/components/StepCard/StepCard';
import { Step } from '@/models/Step';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type StepEditCallback = (workflowId: string, stepIndex: number) => void;
type DeleteWorkflowCallback = (workflowId: string) => void;

type WorkflowCardProps = CardProps & {
  id: string;
  isRoot?: boolean;
  isFixed?: boolean;
  isExpanded?: boolean;
  isEditable?: boolean;
  onAddStep?: StepEditCallback;
  onSelectStep?: StepEditCallback;
  onDeleteWorkflow?: DeleteWorkflowCallback;
};

type WorkflowChainProps = Pick<WorkflowCardProps, 'id' | 'isEditable' | 'onSelectStep' | 'onAddStep'>;

const WorkflowCard = ({
  id,
  isRoot,
  isFixed,
  isExpanded,
  isEditable,
  onAddStep,
  onSelectStep,
  onDeleteWorkflow,
  ...props
}: WorkflowCardProps) => {
  const workflow = useWorkflow({ id });
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });

  if (!workflow) {
    // TODO: Missing mpty state
    // eslint-disable-next-line no-console
    console.warn(`Workflow '${id}' is not found in yml!`);
    return null;
  }

  const hasNoSteps = !workflow.steps?.length;
  const stack = workflow.meta?.['bitrise.io']?.stack || 'Unknown stack';

  return (
    <Card variant={isRoot ? 'elevated' : 'outline'} {...props}>
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
            {workflow.title || id}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {stack}
          </Text>
        </Box>
        {isEditable && (
          <ButtonGroup ml="4" display="none" _groupHover={{ display: 'flex' }}>
            <ControlButton
              size="xs"
              iconName="Trash"
              onClick={() => onDeleteWorkflow?.(id)}
              aria-label={isRoot ? `Delete '${id}' workflow` : `Remove '${id}' from the chain`}
            />
          </ButtonGroup>
        )}
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }} unmountOnExit={false}>
        <Box display="flex" flexDir="column" gap="8" p="8">
          {isRoot && (
            <BeforeRunWorkflows id={id} isEditable={isEditable} onAddStep={onAddStep} onSelectStep={onSelectStep} />
          )}

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
              <Fragment key={`workflows[${id}].steps[${stepIndex}][${cvs}]`}>
                {isEditable && <AddStepButton onClick={() => onAddStep?.(id, stepIndex)} my={-8} />}
                <StepCard
                  workflowId={id}
                  stepIndex={stepIndex}
                  onClick={onSelectStep && (() => onSelectStep(id, stepIndex))}
                  showSecondary
                />
                {isEditable && isLastStep && <AddStepButton onClick={() => onAddStep?.(id, stepIndex + 1)} my={-8} />}
              </Fragment>
            );
          })}

          {isRoot && (
            <AfterRunWorkflows id={id} isEditable={isEditable} onAddStep={onAddStep} onSelectStep={onSelectStep} />
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

const BeforeRunWorkflows = ({ id, ...props }: WorkflowChainProps) => {
  const chain = useBeforeRunWorkflows({ id });
  const hasChainedWorkflows = chain.length > 0;
  const deleteChainedWorkflow = useBitriseYmlStore(useShallow((s) => s.deleteChainedWorkflow));

  return (
    <>
      {chain.map(({ id: chainedWorkflowId, parentId: parentWorkflowId, index: chainedWorkflowIndex }) => {
        const onDeleteWorkflow = () => deleteChainedWorkflow(chainedWorkflowIndex, parentWorkflowId, 'before_run');

        return (
          <WorkflowCard
            key={`before_run:${chainedWorkflowIndex}:${chainedWorkflowId}->${parentWorkflowId}->${id}`}
            {...props}
            id={chainedWorkflowId}
            isRoot={false}
            onDeleteWorkflow={onDeleteWorkflow}
          />
        );
      })}
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
    </>
  );
};

const AfterRunWorkflows = ({ id, ...props }: WorkflowChainProps) => {
  const chain = useAfterRunWorkflows({ id });
  const hasChainedWorkflows = chain.length > 0;
  const deleteChainedWorkflow = useBitriseYmlStore(useShallow((s) => s.deleteChainedWorkflow));

  return (
    <>
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      {chain.map(({ id: chainedWorkflowId, parentId: parentWorkflowId, index: chainedWorkflowIndex }) => {
        const onDeleteWorkflow = () => deleteChainedWorkflow(chainedWorkflowIndex, parentWorkflowId, 'after_run');

        return (
          <WorkflowCard
            key={`after_run:${chainedWorkflowIndex}:${id}->${parentWorkflowId}->${chainedWorkflowId}`}
            {...props}
            id={chainedWorkflowId}
            isRoot={false}
            onDeleteWorkflow={onDeleteWorkflow}
          />
        );
      })}
    </>
  );
};

export default WorkflowCard;
