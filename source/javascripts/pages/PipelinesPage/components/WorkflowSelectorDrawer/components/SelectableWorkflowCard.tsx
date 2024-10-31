import { memo } from 'react';
import { Card, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';
import useWorkflow from '@/hooks/useWorkflow';
import useStacksAndMachines from '@/components/unified-editor/WorkflowConfig/hooks/useStacksAndMachines';
import StackAndMachineService from '@/core/models/StackAndMachineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/models/WorkflowService';
import { WorkflowCard } from '@/components/unified-editor';

type Props = {
  id: string;
  onClick?: VoidFunction;
};

const SelectableWorkflowCard = ({ id, onClick }: Props) => {
  const workflow = useWorkflow(id);
  const { data: stackAndMachines } = useStacksAndMachines();

  const usedInPipelinesText = useBitriseYmlStore(({ yml: { pipelines, stages } }) => {
    const count = WorkflowService.countInPipelines(id, pipelines, stages);

    if (count === 0) {
      return 'Not used by other Pipelines';
    }

    if (count === 1) {
      return 'Used in 1 Pipeline';
    }

    return `Used in ${count} Pipelines`;
  });

  const stack = workflow?.userValues.meta?.['bitrise.io']?.stack || '';
  const machineTypeId = workflow?.userValues.meta?.['bitrise.io']?.machine_type_id || '';

  const { selectedStack } = StackAndMachineService.selectStackAndMachine({
    ...stackAndMachines,
    initialStackId: stack,
    selectedStackId: stack,
    initialMachineTypeId: machineTypeId,
    selectedMachineTypeId: machineTypeId,
  });

  return (
    <Popover trigger="hover" placement="left-start" offset={[0, 40]} isLazy>
      <PopoverTrigger>
        <Card
          py="8"
          px="16"
          role="button"
          variant="outline"
          onClick={onClick}
          _hover={{ boxShadow: 'small', borderColor: 'border/hover' }}
        >
          <Text textStyle="body/lg/semibold">{workflow?.userValues.title || workflow?.id}</Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {usedInPipelinesText}
            {' • '}
            {selectedStack.name || stack || 'Unknown stack'}
          </Text>
        </Card>
      </PopoverTrigger>
      <PopoverContent width={320}>
        <WorkflowCard id={id} />
      </PopoverContent>
    </Popover>
  );
};

export default memo(SelectableWorkflowCard);
