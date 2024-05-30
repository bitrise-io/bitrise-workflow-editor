import { Box, Card, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import useWorkflow from '../../hooks/useWorkflow';
import useMeta from '../../hooks/useMeta';
import StepCard from './StepCard';

type WorkflowCardHeaderProps = {
  title: string;
  stack: string;
  isOpen: boolean;
  onToggle: () => void;
};

const WorkflowCardHeader = ({ title, stack, isOpen, onToggle }: WorkflowCardHeaderProps) => {
  return (
    <Box display="flex" alignItems="center" gap="4" px="4" py="6">
      <ControlButton
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} workflow details`}
        size="xs"
        iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
        onClick={onToggle}
      />
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

type WorkflowCardProps = {
  id: string;
  isExpanded?: boolean;
};

const WorkflowCard = ({ id, isExpanded = false }: WorkflowCardProps) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isExpanded });
  const { title, meta: workflowMeta, steps } = useWorkflow({ id });
  const meta = useMeta({ override: workflowMeta });
  const stack = meta['bitrise.io']?.stack || 'Unknown stack';

  return (
    <Card variant="elevated">
      <WorkflowCardHeader title={title || id} stack={stack} isOpen={isOpen} onToggle={onToggle} />
      <Collapse in={isOpen} style={{ overflow: 'unset' }}>
        <Box display="flex" flexDir="column" gap="8" padding="8">
          {(steps?.length || 0) === 0 && (
            <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
              <Text textStyle="body/sm/regular" color="text/secondary">
                This Workflow is empty.
              </Text>
            </Card>
          )}
          {steps?.map((s, index) => {
            const [cvs = '', step] = Object.entries(s)[0];
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
        </Box>
      </Collapse>
    </Card>
  );
};

export default WorkflowCard;
