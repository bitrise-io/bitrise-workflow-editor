import { Box, Link, Notification } from '@bitrise/bitkit';
import { ReactNode, RefObject, useCallback, useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';

import ToolVersions from '@/components/ToolVersions/ToolVersions';
import StackAndMachineService from '@/core/services/StackAndMachineService';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';
import { useIsReadOnlyView } from '@/hooks/useTree';

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
  workflowId?: string;
  /** Read-only regardless of the active view — e.g. an inherited default shown in a module that
   * doesn't define it. OR-ed with the merged/cross-repo read-only view. */
  forceReadOnly?: boolean;
  /** Rendered at the trailing edge of the stack/machine selector row — e.g. a jump-to-definition
   * arrow on the modular read-only views. */
  selectsTrailing?: ReactNode;
};

const StackAndMachine = ({
  isExpandable,
  stackId,
  machineTypeId,
  onChange,
  withMachineFallbacks,
  stackRollbackVersion,
  withoutDefaultOptions,
  workflowId,
  forceReadOnly,
  selectsTrailing,
}: Props) => {
  const isToolVersionsEnabled = useFeatureFlag('enable-wfe-tool-versions');
  const isReadOnlyView = useIsReadOnlyView() || Boolean(forceReadOnly);
  const ref = useRef<HTMLDivElement>(null);
  const orientation = useOrientation(ref);
  const { data, isLoading } = useStacksAndMachines();
  const { projectStackId, projectMachineTypeId } = useProjectStackAndMachine();

  const rollbackType = PageProps.app()?.isOwnerPaying ? 'paying' : 'free';
  const rollbackVersionFeatureEnabled = GlobalProps.accountFeatureFlags()?.rollbackVersionFeatureEnabled;
  const disableRollbackOption = rollbackVersionFeatureEnabled === false;

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
          isDisabled={isReadOnlyView}
          isInvalid={isInvalidStack && !isLoading}
          optionGroups={stackOptionGroups}
          onChange={(selectedStackValue, useRollbackVersionChecked) =>
            handleChange(selectedStackValue, selectedMachineType.value, useRollbackVersionChecked)
          }
          isRollbackVersionAvailable={!!availableRollbackVersion}
          disableRollbackOption={disableRollbackOption}
          useRollbackVersion={useRollbackVersion}
          width={orientation === 'horizontal' ? '50%' : undefined}
        />
        <MachineTypeSelector
          machineType={selectedMachineType}
          isLoading={isLoading}
          isInvalid={isInvalidMachineType && !isLoading}
          isDisabled={isMachineTypeSelectionDisabled || isReadOnlyView}
          optionGroups={machineOptionGroups}
          onChange={(selectedMachineTypeValue) => handleChange(selectedStack.value, selectedMachineTypeValue)}
          selectedRegion={data?.region}
          width={orientation === 'horizontal' ? '50%' : undefined}
        />
        {selectsTrailing && (
          // Align with the select inputs (which sit below their labels), not the label row.
          <Box alignSelf={orientation === 'horizontal' ? 'flex-start' : 'flex-end'} marginBlockStart="24">
            {selectsTrailing}
          </Box>
        )}
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
      {isToolVersionsEnabled && <ToolVersions workflowId={workflowId} />}
    </StackAndMachineWrapper>
  );
};

export default StackAndMachine;
