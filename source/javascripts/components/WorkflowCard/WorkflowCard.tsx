import { Box, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';
import { useAfterRunWorkflows, useBeforeRunWorkflows } from './hooks/useWorkflowChain';
import useMeta from './hooks/useMeta';
import useWorkflow from './hooks/useWorkflow';
import AddStepButton from './components/AddStepButton';
import StepCard from '@/components/StepCard/StepCard';
import { Step } from '@/models/Step';

type WorkflowCardHeaderProps = {
  title: string;
  stack: string;
  isOpen: boolean;
  isFixed?: boolean;
  onToggle: () => void;
};

const WorkflowCardHeader = ({ title, stack, isOpen, isFixed, onToggle }: WorkflowCardHeaderProps) => {
  return (
    <Box display="flex" alignItems="center" gap="4" px={isFixed ? 12 : 4} py="6">
      {!isFixed && (
        <ControlButton
          size="xs"
          className="nopan"
          onClick={onToggle}
          iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} workflow details`}
        />
      )}
      <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
        <Text textStyle="body/md/semibold" hasEllipsis>
          {title}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
          {stack}
        </Text>
      </Box>
    </Box>
  );
};

type WorkflowChainProps = {
  id: string;
  isEditable?: boolean;
  onClickStep?: (workflowId: string, index: number) => void;
  onClickAddStepButton?: (workflowId: string, index: number) => void;
};

const BeforeRunWorkflows = ({ id, isEditable, onClickStep, onClickAddStepButton }: WorkflowChainProps) => {
  const ids = useBeforeRunWorkflows({ id });
  const hasChainedWorkflows = ids.length > 0;

  return (
    <>
      {ids.map((workflowId) => (
        <WorkflowCard
          key={workflowId}
          id={workflowId}
          isRoot={false}
          isEditable={isEditable}
          onClickStep={onClickStep}
          onClickAddStepButton={onClickAddStepButton}
        />
      ))}
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
    </>
  );
};

const AfterRunWorkflows = ({ id, isEditable, onClickStep, onClickAddStepButton }: WorkflowChainProps) => {
  const ids = useAfterRunWorkflows({ id });
  const hasChainedWorkflows = ids.length > 0;

  return (
    <>
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      {ids.map((workflowId) => (
        <WorkflowCard
          key={workflowId}
          id={workflowId}
          isRoot={false}
          isEditable={isEditable}
          onClickStep={onClickStep}
          onClickAddStepButton={onClickAddStepButton}
        />
      ))}
    </>
  );
};

type WorkflowCardProps = CardProps & {
  id: string;
  isRoot?: boolean;
  isFixed?: boolean;
  isExpanded?: boolean;
  isEditable?: boolean;
  onClickStep?: (workflowId: string, index: number) => void;
  onClickAddStepButton?: (workflowId: string, index: number) => void;
};

const WorkflowCard = ({
  id,
  isRoot = true,
  isExpanded,
  isFixed,
  isEditable,
  onClickStep,
  onClickAddStepButton,
  ...props
}: WorkflowCardProps) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });
  const { title, meta: workflowMeta, steps } = useWorkflow({ id });
  const meta = useMeta({ override: workflowMeta });

  const stack = meta['bitrise.io']?.stack || 'Unknown stack';
  const numberOfSteps = steps?.length ?? 0;
  const hasNoSteps = numberOfSteps === 0;

  return (
    <Card variant={isRoot ? 'elevated' : 'outline'} {...props}>
      <WorkflowCardHeader title={title || id} stack={stack} isOpen={isOpen} isFixed={isFixed} onToggle={onToggle} />
      <Collapse in={isOpen} style={{ overflow: 'unset' }} unmountOnExit={false}>
        <Box display="flex" flexDir="column" gap="8" p="8">
          {isRoot && (
            <BeforeRunWorkflows
              id={id}
              isEditable={isEditable}
              onClickStep={onClickStep}
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

          {steps?.map((s, index) => {
            const isLastStep = index === numberOfSteps - 1;
            const [cvs = ''] = Object.entries(s)[0] as [string, Step];

            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`workflows[${id}].steps[${index}][${cvs}]`}>
                {isEditable && <AddStepButton onClick={() => onClickAddStepButton?.(id, index)} my={-8} />}
                <StepCard
                  workflowId={id}
                  stepIndex={index}
                  onClick={onClickStep && (() => onClickStep(id, index))}
                  showSecondary
                />
                {isEditable && isLastStep && (
                  <AddStepButton onClick={() => onClickAddStepButton?.(id, index + 1)} my={-8} />
                )}
              </Fragment>
            );
          })}

          {isRoot && (
            <AfterRunWorkflows
              id={id}
              isEditable={isEditable}
              onClickStep={onClickStep}
              onClickAddStepButton={onClickAddStepButton}
            />
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default WorkflowCard;
