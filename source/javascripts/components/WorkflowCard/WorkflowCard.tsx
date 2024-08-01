import { Fragment } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { useAfterRunWorkflows, useBeforeRunWorkflows } from './hooks/useWorkflowChain';
import useMeta from './hooks/useMeta';
import useWorkflow from './hooks/useWorkflow';
import AddStepButton from './components/AddStepButton';
import StepCard from '@/components/StepCard/StepCard';
import { Step } from '@/models/Step';
import { ChainedWorkflowPlacement } from '@/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type WorkflowCardProps = CardProps & {
  id: string;
  index?: number;
  isFixed?: boolean;
  parentId?: string;
  placement?: ChainedWorkflowPlacement;
  isExpanded?: boolean;
  isEditable?: boolean;
  onClickStep?: (workflowId: string, index: number) => void;
  onDeleteWorkflow?: (workflowId: string) => void;
  onClickAddStepButton?: (workflowId: string, index: number) => void;
};

type WorkflowChainProps = Pick<
  WorkflowCardProps,
  'id' | 'isEditable' | 'onClickStep' | 'onClickAddStepButton' | 'onDeleteWorkflow'
>;

const WorkflowCard = ({
  id,
  index,
  isFixed,
  parentId,
  placement,
  isExpanded,
  isEditable,
  onClickStep,
  onDeleteWorkflow,
  onClickAddStepButton,
  ...props
}: WorkflowCardProps) => {
  const { title, meta: workflowMeta, steps } = useWorkflow({ id });
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });
  const deleteWorkflowFromChain = useBitriseYmlStore(useShallow((s) => s.deleteWorkflowFromChain));

  const meta = useMeta({ override: workflowMeta });

  const stack = meta['bitrise.io']?.stack || 'Unknown stack';
  const numberOfSteps = steps?.length ?? 0;
  const hasNoSteps = numberOfSteps === 0;
  const isRoot = !parentId && !placement;

  const onDelete = () => {
    if (isRoot && isEditable && onDeleteWorkflow) {
      onDeleteWorkflow(id);
    }

    if (!isRoot && isEditable && parentId && placement && index !== undefined) {
      deleteWorkflowFromChain(parentId, index, placement);
    }
  };

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
            {title || id}
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
              onClick={onDelete}
              aria-label={isRoot ? `Delete '${id}' workflow` : `Remove '${id}' from '${parentId}.${placement}'`}
            />
          </ButtonGroup>
        )}
      </Box>
      <Collapse in={isOpen} style={{ overflow: 'unset' }} unmountOnExit={false}>
        <Box display="flex" flexDir="column" gap="8" p="8">
          {isRoot && (
            <BeforeRunWorkflows
              id={id}
              isEditable={isEditable}
              onClickStep={onClickStep}
              onDeleteWorkflow={onDeleteWorkflow}
              onClickAddStepButton={onClickAddStepButton}
            />
          )}

          {hasNoSteps && (
            <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
              <Text textStyle="body/sm/regular" color="text/secondary">
                This Workflow is empty.
              </Text>
            </Card>
          )}

          {steps?.map((s, stepIndex) => {
            const isLastStep = stepIndex === numberOfSteps - 1;
            const [cvs = ''] = Object.entries(s)[0] as [string, Step];

            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`workflows[${id}].steps[${stepIndex}][${cvs}]`}>
                {isEditable && <AddStepButton onClick={() => onClickAddStepButton?.(id, stepIndex)} my={-8} />}
                <StepCard
                  workflowId={id}
                  stepIndex={stepIndex}
                  onClick={onClickStep && (() => onClickStep(id, stepIndex))}
                  showSecondary
                />
                {isEditable && isLastStep && (
                  <AddStepButton onClick={() => onClickAddStepButton?.(id, stepIndex + 1)} my={-8} />
                )}
              </Fragment>
            );
          })}

          {isRoot && (
            <AfterRunWorkflows
              id={id}
              isEditable={isEditable}
              onClickStep={onClickStep}
              onDeleteWorkflow={onDeleteWorkflow}
              onClickAddStepButton={onClickAddStepButton}
            />
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

const BeforeRunWorkflows = ({ id, ...props }: WorkflowChainProps) => {
  const chain = useBeforeRunWorkflows({ id });
  const hasChainedWorkflows = chain.length > 0;

  return (
    <>
      {chain.map(({ id: beforeWorkflowId, parentId, index, placement }) => (
        <WorkflowCard
          key={`${index}:${placement}:${beforeWorkflowId}->${parentId}->${id}`}
          id={beforeWorkflowId}
          index={index}
          parentId={parentId}
          placement={placement}
          {...props}
        />
      ))}
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
    </>
  );
};

const AfterRunWorkflows = ({ id, ...props }: WorkflowChainProps) => {
  const chain = useAfterRunWorkflows({ id });
  const hasChainedWorkflows = chain.length > 0;

  return (
    <>
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      {chain.map(({ id: afterWorkflowId, parentId, index, placement }) => (
        <WorkflowCard
          key={`${index}:${placement}:${id}->${parentId}->${afterWorkflowId}`}
          id={afterWorkflowId}
          index={index}
          parentId={parentId}
          placement={placement}
          {...props}
        />
      ))}
    </>
  );
};

export default WorkflowCard;
