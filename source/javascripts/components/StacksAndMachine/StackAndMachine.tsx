import { RefObject, useCallback, useRef } from 'react';
import { Box, BoxProps } from '@bitrise/bitkit';

import { useResizeObserver } from 'usehooks-ts';

import PageProps from '@/core/utils/PageProps';

import StackAndMachineService from '@/core/services/StackAndMachineService';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

import MachineTypeSelector from './MachineTypeSelector';
import StackSelector from './StackSelector';

const useOrientation = (ref: RefObject<HTMLDivElement>) => {
  const { width } = useResizeObserver({ ref, box: 'border-box' });
  return width && width < 768 ? 'vertical' : 'horizontal';
};

type Props = {
  as?: BoxProps['as'];
  stackId: string;
  machineTypeId: string;
  onChange: (stackId: string, machineTypeId: string, rollbackVersion: string) => void;
  useRollbackVersion?: boolean;
  withoutDefaultStack?: boolean;
};

const StackAndMachine = ({
  as = 'div',
  stackId,
  machineTypeId,
  onChange,
  useRollbackVersion,
  withoutDefaultStack,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const orientation = useOrientation(ref);
  const { data, isLoading } = useStacksAndMachines();

  const rollbackType = PageProps.app()?.isOwnerPaying ? 'paying' : 'free';

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
    withoutDefaultStack,
  });

  const availableRollbackVersion =
    selectedStack.rollbackVersion?.[selectedMachineType.id as keyof typeof selectedStack.rollbackVersion]?.[
      rollbackType
    ] || '';

  const handleChange = useCallback(
    (selectedStackId: string, selectedMachineTypeId: string, useRollbackVersionChecked?: boolean) => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: selectedStackId,
        machineTypeId: selectedMachineTypeId,
        defaultStackId: data?.defaultStackId || '',
        availableStacks: data?.availableStacks,
        availableMachineTypes: data?.availableMachineTypes,
      });
      onChange(result.stackId, result.machineTypeId, useRollbackVersionChecked ? availableRollbackVersion : '');
    },
    [availableRollbackVersion, data?.availableMachineTypes, data?.availableStacks, data?.defaultStackId, onChange],
  );

  return (
    <Box as={as} ref={ref} display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24" p="16">
      <StackSelector
        stack={selectedStack}
        isLoading={isLoading}
        isInvalid={isInvalidStack}
        options={availableStackOptions}
        onChange={(selectedStackValue, useRollbackVersionChecked) =>
          handleChange(selectedStackValue, selectedMachineType.value, useRollbackVersionChecked)
        }
        isRollbackVersionAvailable={!!availableRollbackVersion}
        useRollbackVersion={useRollbackVersion}
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
