import { RefObject, useCallback, useRef } from 'react';
import { Box, Card, Link, Notification, NotificationProps } from '@bitrise/bitkit';

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
  stackId: string;
  machineTypeId: string;
  onChange: (stackId: string, machineTypeId: string, rollbackVersion: string) => void;
  stackRollbackVersion?: string;
  withoutDefaultStack?: boolean;
  notificationProps?: NotificationProps;
};

const StackAndMachine = ({
  stackId,
  machineTypeId,
  onChange,
  stackRollbackVersion,
  withoutDefaultStack,
  notificationProps,
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

  const useRollbackVersion =
    !!stackRollbackVersion && !!availableRollbackVersion && stackRollbackVersion === availableRollbackVersion;

  return (
    <Card padding="16">
      <Box ref={ref} display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24">
        <StackSelector
          stack={selectedStack}
          isLoading={isLoading}
          isInvalid={isInvalidStack && !isLoading}
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
          isInvalid={isInvalidMachineType && !isLoading}
          isDisabled={isMachineTypeSelectionDisabled}
          options={availableMachineTypeOptions}
          onChange={(selectedMachineTypeValue) => handleChange(selectedStack.value, selectedMachineTypeValue)}
        />
      </Box>
      {useRollbackVersion && (
        <Notification flex="0" marginBlockStart="12" status="warning">
          Previous version is a rollback option we provide if your build is failing after a Stack Update. Please keep in
          mind that this option is only available for a limited time, usually 2-3 days after a Stack Update. Once
          removed, your build will run on the latest Stable Stack.{' '}
          <Link
            href="https://devcenter.bitrise.io/en/infrastructure/build-stacks/stack-update-policy.html#using-the-previous-version-of-a-stack"
            isExternal
            isUnderlined
          >
            Learn more
          </Link>
        </Notification>
      )}
      {!!notificationProps && <Notification marginBlockStart="12" {...notificationProps} />}
    </Card>
  );
};

export default StackAndMachine;
