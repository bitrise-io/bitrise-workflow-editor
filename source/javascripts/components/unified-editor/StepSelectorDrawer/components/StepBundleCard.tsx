import { Box, Card, CardProps, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { StepActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type StepBundleCardProps = StepActions & {
  stepBundleId: string;
  isCollapsable?: boolean;
  containerProps?: CardProps;
};

const StepBundleCard = (props: StepBundleCardProps) => {
  const { stepBundleId, isCollapsable, containerProps } = props;
  const { isOpen, onToggle, onOpen } = useDisclosure({ defaultIsOpen: !isCollapsable });
  const dependants = useDependantWorkflows({ stepBundleId });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  return (
    <Card borderRadius="8" variant="elevated" minW={0} {...containerProps}>
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
          <Text textStyle="body/md/semibold" hasEllipsis>
            {stepBundleId}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {usedInWorkflowsText}
          </Text>
        </Box>
      </Box>
    </Card>
  );
};
export default StepBundleCard;
function getUsedByText() {
  throw new Error('Function not implemented.');
}
