import { Card, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';

type SelectableStepBundleCardProps = {
  id: string;
  onClick: (id: string) => void;
};

const SelectableStepBundleCard = (props: SelectableStepBundleCardProps) => {
  const { id, onClick } = props;
  const dependants = useDependantWorkflows({ stepBundleId: id });
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
          onClick={() => onClick(id)}
        >
          <Text textStyle="body/lg/semibold" marginBlockEnd="4">
            {id}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {usedInWorkflowsText}
          </Text>
        </Card>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <WorkflowCardContextProvider>
          <StepBundleCard id={id} />
        </WorkflowCardContextProvider>
      </PopoverContent>
    </Popover>
  );
};

export default SelectableStepBundleCard;
