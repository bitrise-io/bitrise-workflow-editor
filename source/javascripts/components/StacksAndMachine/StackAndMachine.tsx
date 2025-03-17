import { useCallback } from 'react';
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

  const handleChange = useCallback(
    (selectedStackId: string, selectedMachineTypeId: string) => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: selectedStackId,
        machineTypeId: selectedMachineTypeId,
        defaultStackId: data?.defaultStackId || '',
        availableStacks: data?.availableStacks,
        availableMachineTypes: data?.availableMachineTypes,
      });
      onChange(result.stackId, result.machineTypeId);
    },
    [data?.availableMachineTypes, data?.availableStacks, data?.defaultStackId, onChange],
  );

  return (
    <Box display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24" p="16">
      <StackSelector
        stack={selectedStack}
        isLoading={isLoading}
        isInvalid={isInvalidInitialStack}
        options={availableStackOptions}
        onChange={(selectedStackValue) => handleChange(selectedStackValue, selectedMachineType.value)}
      />
      <MachineTypeSelector
        machineType={selectedMachineType}
        isLoading={isLoading}
        isInvalid={isInvalidInitialMachineType}
        isDisabled={isMachineTypeSelectionDisabled}
        options={availableMachineTypeOptions}
        onChange={(selectedMachineTypeValue) => handleChange(selectedStack.value, selectedMachineTypeValue)}
      />
    </Box>
  );
};

export default StackAndMachine;
