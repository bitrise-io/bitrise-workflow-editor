import { Box, Link, Notification } from '@bitrise/bitkit';
import { RefObject, useCallback, useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';

import StackAndMachineService from '@/core/services/StackAndMachineService';
import PageProps from '@/core/utils/PageProps';
import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

import DeprecatedMachineNotification from './DeprecatedMachineNotification';
import MachineTypeSelector from './MachineTypeSelector';
import StackAndMachineWrapper from './StackAndMachineWrapper';
import StackSelector from './StackSelector';

const useOrientation = (ref: RefObject<HTMLDivElement>) => {
  const { width } = useResizeObserver({ ref, box: 'border-box' });
  return width && width < 960 ? 'vertical' : 'horizontal';
};

type Props = {
  isExpandable?: boolean;
  stackId: string;
  machineTypeId: string;
  onChange: (stackId: string, machineTypeId: string, rollbackVersion: string) => void;
  withMachineFallbacks?: boolean;
  stackRollbackVersion?: string;
  withoutDefaultOptions?: boolean;
};

const StackAndMachine = ({
  isExpandable,
  stackId,
  machineTypeId,
  onChange,
  withMachineFallbacks,
  stackRollbackVersion,
  withoutDefaultOptions,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const orientation = useOrientation(ref);
  const { data, isLoading } = useStacksAndMachines();
  const { projectStackId, projectMachineTypeId } = useProjectStackAndMachine();

  const rollbackType = PageProps.app()?.isOwnerPaying ? 'paying' : 'free';

  const {
    selectedStack,
    selectedMachineType,
    stackOptionGroups,
    machineOptionGroups,
    isInvalidStack,
    isInvalidMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.prepareStackAndMachineSelectionData({
    ...data,
    projectStackId,
    projectMachineTypeId,
    selectedStackId: stackId,
    selectedMachineTypeId: machineTypeId,
    withoutDefaultOptions,
  });

  const availableRollbackVersion =
    selectedStack.rollbackVersion?.[selectedMachineType.id as keyof typeof selectedStack.rollbackVersion]?.[
      rollbackType
    ] || '';

  const handleChange = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    (selectedStackId: string, selectedMachineTypeId: string, useRollbackVersionChecked?: boolean) => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: selectedStackId,
        machineTypeId: selectedMachineTypeId,
        projectStackId,
        machineFallbackOptions: withMachineFallbacks
          ? {
              defaultMachineTypeIdOfOSs: data?.defaultMachines
                ? Object.fromEntries(data.defaultMachines.map((machine) => [machine.os, machine.id]))
                : {},
              projectMachineTypeId,
            }
          : undefined,
        availableStacks: data?.availableStacks || [],
        availableMachines: data?.availableMachines || [],
      });
      onChange(result.stackId, result.machineTypeId, useRollbackVersionChecked ? availableRollbackVersion : '');
    },
    [
      availableRollbackVersion,
      data?.availableMachines,
      data?.availableStacks,
      data?.defaultMachines,
      onChange,
      projectMachineTypeId,
      projectStackId,
      withMachineFallbacks,
    ],
  );

  const useRollbackVersion =
    !!stackRollbackVersion && !!availableRollbackVersion && stackRollbackVersion === availableRollbackVersion;

  return (
    <StackAndMachineWrapper
      isDefault={!stackId && !machineTypeId}
      isExpandable={isExpandable}
      machineTypeName={selectedMachineType.name}
      stackName={selectedStack.name}
    >
      <Box ref={ref} display="flex" flexDir={orientation === 'horizontal' ? 'row' : 'column'} gap="24">
        <StackSelector
          stack={selectedStack}
          isLoading={isLoading}
          isInvalid={isInvalidStack && !isLoading}
          optionGroups={stackOptionGroups}
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
          optionGroups={machineOptionGroups}
          onChange={(selectedMachineTypeValue) => handleChange(selectedStack.value, selectedMachineTypeValue)}
        />
      </Box>
      {useRollbackVersion && (
        <Notification flex="0" marginBlockStart="12" status="warning">
          Previous version is a rollback option we provide if your build is failing after a Stack Update. Please keep in
          mind that this option is only available for a limited time, usually 2-3 days after a Stack Update. Once
          removed, your build will run on the latest Stable Stack.{' '}
          <Link
            href="https://docs.bitrise.io/en/bitrise-platform/infrastructure/build-stacks/stack-update-policy.html#using-the-previous-version-of-a-stack"
            isExternal
            isUnderlined
          >
            Learn more
          </Link>
        </Notification>
      )}
      <DeprecatedMachineNotification machineTypeId={selectedMachineType.id} />
    </StackAndMachineWrapper>
  );
};

export default StackAndMachine;
