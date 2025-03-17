import { Box } from '@bitrise/bitkit';

import StackAndMachineService from '@/core/services/StackAndMachineService';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

import MachineTypeSelector from './MachineTypeSelector';
import StackSelector from './StackSelector';

type Props = {
  orientation?: 'horizontal' | 'vertical';
  stackId: string;
  machineTypeId: string;
  onChange: (stackId: string, machineTypeId: string) => void;
};

const StackAndMachine = ({ orientation = 'horizontal', stackId, machineTypeId, onChange }: Props) => {
  const { data, isLoading } = useStacksAndMachines();

  const {
    selectedStack,
    selectedMachineType,
    availableStackOptions,
    availableMachineTypeOptions,
    isInvalidInitialStack,
    isInvalidInitialMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.selectStackAndMachine({
    ...data,
    initialStackId: stackId,
    selectedStackId: stackId,
    initialMachineTypeId: machineTypeId,
    selectedMachineTypeId: machineTypeId,
  });

  return (
    <Box display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24" p="16">
      <StackSelector
        stack={selectedStack}
        isLoading={isLoading}
        isInvalid={isInvalidInitialStack}
        options={availableStackOptions}
        onChange={(value) => {
          const { stackId: newStackId, machineTypeId: newMachineTypeId } = StackAndMachineService.changeStackAndMachine(
            {
              stackId: value,
              machineTypeId: selectedMachineType.value,
              defaultStackId: data?.defaultStackId || '',
              availableStacks: data?.availableStacks,
              availableMachineTypes: data?.availableMachineTypes,
            },
          );
          onChange(newStackId, newMachineTypeId);
        }}
      />
      <MachineTypeSelector
        machineType={selectedMachineType}
        isLoading={isLoading}
        isInvalid={isInvalidInitialMachineType}
        isDisabled={isMachineTypeSelectionDisabled}
        options={availableMachineTypeOptions}
        onChange={(value) => {
          const { stackId: newStackId, machineTypeId: newMachineTypeId } = StackAndMachineService.changeStackAndMachine(
            {
              stackId: selectedStack.value,
              machineTypeId: value,
              defaultStackId: data?.defaultStackId || '',
              availableStacks: data?.availableStacks,
              availableMachineTypes: data?.availableMachineTypes,
            },
          );
          onChange(newStackId, newMachineTypeId);
        }}
      />
    </Box>
  );
};

export default StackAndMachine;
