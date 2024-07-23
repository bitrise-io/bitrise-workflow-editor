import { Box, Card, CardProps, Collapse, ControlButton, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import useWorkflow from '../../pages/PipelinesPage/hooks/useWorkflow';
import useMeta from '../../pages/PipelinesPage/hooks/useMeta';
import { useAfterRunWorkflows, useBeforeRunWorkflows } from '../../pages/PipelinesPage/hooks/useWorkflowChain';
import StepCard from '../../pages/PipelinesPage/components/StepCard';
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
};

const BeforeRunWorkflows = ({ id }: WorkflowChainProps) => {
  const ids = useBeforeRunWorkflows({ id });
  const hasChainedWorkflows = ids.length > 0;

  return (
    <>
      {ids.map((workflowId) => (
        <WorkflowCard key={workflowId} id={workflowId} isRoot={false} />
      ))}
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" />}
    </>
  );
};

const AfterRunWorkflows = ({ id }: WorkflowChainProps) => {
  const ids = useAfterRunWorkflows({ id });
  const hasChainedWorkflows = ids.length > 0;

  return (
    <>
      {hasChainedWorkflows && <Icon name="ArrowDown" size="16" color="icon/tertiary" />}
      {ids.map((workflowId) => (
        <WorkflowCard key={workflowId} id={workflowId} isRoot={false} />
      ))}
    </>
  );
};

type WorkflowCardProps = CardProps & {
  id: string;
  isRoot?: boolean;
  isFixed?: boolean;
  isExpanded?: boolean;
};

const WorkflowCard = ({ id, isRoot = true, isExpanded, isFixed, ...props }: WorkflowCardProps) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded || isFixed });
  const { title, meta: workflowMeta, steps } = useWorkflow({ id });
  const meta = useMeta({ override: workflowMeta });

  const stack = meta['bitrise.io']?.stack || 'Unknown stack';

  return (
    <Card variant={isRoot ? 'elevated' : 'outline'} {...props}>
      <WorkflowCardHeader title={title || id} stack={stack} isOpen={isOpen} isFixed={isFixed} onToggle={onToggle} />
      <Collapse in={isOpen} style={{ overflow: 'unset' }} unmountOnExit={false}>
        <Box display="flex" flexDir="column" alignItems="center" gap="8" padding="8">
          {isRoot && <BeforeRunWorkflows id={id} />}

          {(steps?.length || 0) === 0 && (
            <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
              <Text textStyle="body/sm/regular" color="text/secondary">
                This Workflow is empty.
              </Text>
            </Card>
          )}

          {steps?.map((s, index) => {
            const [cvs = '', step] = Object.entries(s)[0] as [string, Step];

            return (
              <StepCard
                // eslint-disable-next-line react/no-array-index-key
                key={`workflows[${id}].steps[${index}][${cvs}]`}
                cvs={cvs}
                title={step.title}
                icon={step.asset_urls?.['icon.svg'] || step.asset_urls?.['icon.png']}
                showSecondary
              />
            );
          })}

          {isRoot && <AfterRunWorkflows id={id} />}
        </Box>
      </Collapse>
    </Card>
  );
};

export default WorkflowCard;
