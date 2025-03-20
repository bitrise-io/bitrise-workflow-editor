import { RefObject, useCallback, useRef } from 'react';
import { Box } from '@bitrise/bitkit';

import { useResizeObserver } from 'usehooks-ts';
import StackAndMachineService from '@/core/services/StackAndMachineService';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

import MachineTypeSelector from './MachineTypeSelector';
import StackSelector from './StackSelector';

const useOrientation = (ref: RefObject<HTMLDivElement>) => {
  const { width } = useResizeObserver({ ref, box: 'border-box' });
  return width && width < 768 ? 'vertical' : 'horizontal';
};

type Props = {
  stackId: string;
  machineTypeId: string;
  onChange: (stackId: string, machineTypeId: string) => void;
};

const StackAndMachine = ({ stackId, machineTypeId, onChange }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const orientation = useOrientation(ref);
  const { data, isLoading } = useStacksAndMachines();

  const {
    selectedStack,
    selectedMachineType,
    availableStackOptions,
    availableMachineTypeOptions,
    isInvalidStack,
    isInvalidMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.prepareStackAndMachineSelectionData({
    ...data,
    selectedStackId: stackId,
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
    <Box ref={ref} display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24" p="16">
      <StackSelector
        stack={selectedStack}
        isLoading={isLoading}
        isInvalid={isInvalidStack}
        options={availableStackOptions}
        onChange={(selectedStackValue) => handleChange(selectedStackValue, selectedMachineType.value)}
      />
      <MachineTypeSelector
        machineType={selectedMachineType}
        isLoading={isLoading}
        isInvalid={isInvalidMachineType}
        isDisabled={isMachineTypeSelectionDisabled}
        options={availableMachineTypeOptions}
        onChange={(selectedMachineTypeValue) => handleChange(selectedStack.value, selectedMachineTypeValue)}
      />
    </Box>
  );
};

export default StackAndMachine;
