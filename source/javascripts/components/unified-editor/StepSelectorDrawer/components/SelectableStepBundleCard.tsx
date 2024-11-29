import { Card, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type SelectableStepBundleCardProps = {
  stepBundleId: string;
  handleClick: (stepBundleId: string) => void;
};

const SelectableStepBundleCard = (props: SelectableStepBundleCardProps) => {
  const { stepBundleId, handleClick } = props;
  const dependants = useDependantWorkflows({ stepBundleId });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  return (
    <Popover trigger="hover" placement="left-start" offset={[0, 40]} isLazy>
      <PopoverTrigger>
        <Card
          as="button"
          variant="outline"
          padding="8px 12px"
          textAlign="left"
          _hover={{ borderColor: 'border/hover' }}
          marginBlockStart="16"
          onClick={() => handleClick(stepBundleId)}
        >
          <Text textStyle="body/lg/semibold" marginBlockEnd="4">
            {stepBundleId}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {usedInWorkflowsText}
          </Text>
        </Card>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <StepBundleCard stepBundleId={stepBundleId} />
      </PopoverContent>
    </Popover>
  );
};

export default SelectableStepBundleCard;
