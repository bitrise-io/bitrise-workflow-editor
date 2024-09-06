import { useEffect } from 'react';
import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useStacks from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/hooks/useStacks';
import useMachineTypes from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/hooks/useMachineTypes';
import StackAndMachineService from '@/core/models/StackAndMachineService';
import { FormValues } from '../WorkflowConfigPanel.types';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
  isDefault?: boolean;
};
const ButtonContent = ({ stackName, machineTypeName, isDefault }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" mr="16" minW={0}>
      <Box display="flex" flexDir="column" alignItems="flex-start" minW={0}>
        <Text textStyle="body/lg/semibold">Stack & Machine</Text>
        <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
          {[stackName, machineTypeName].filter(Boolean).join(' • ')}
        </Text>
      </Box>
      {isDefault && (
        <Badge variant="subtle" colorScheme="info">
          Default
        </Badge>
      )}
    </Box>
  );
};

const StackAndMachineCard = () => {
  const { watch, register, setValue, formState } = useFormContext<FormValues>();

  const [appSlug = '', defaultStackId, defaultMachineTypeId, stackId, machineTypeId, canChangeMachineType] = watch([
    'appSlug',
    'defaultStackId',
    'defaultMachineTypeId',
    'configuration.stackId',
    'configuration.machineTypeId',
    'isMachineTypeSelectorAvailable',
  ]);

  const { isLoading: isStacksLoading, data: stacks = [] } = useStacks({
    appSlug,
  });

  const { isLoading: isMachinesLoading, data: machines = [] } = useMachineTypes({
    appSlug,
    canChangeMachineType,
  });

  const isDedicatedMachine = !canChangeMachineType;
  const isSelfHostedRunner = !defaultMachineTypeId;
  const isLoading = isStacksLoading || isMachinesLoading;
  const isStackSelectorTouched = Boolean(
    formState.dirtyFields.configuration?.stackId || formState.touchedFields.configuration?.stackId,
  );
  const isMachineTypeSelectorTouched = Boolean(
    formState.dirtyFields.configuration?.machineTypeId || formState.touchedFields.configuration?.machineTypeId,
  );

  const {
    selectedStack,
    availableStackOptions,
    isInvalidInitialStack,
    selectedMachineType,
    availableMachineTypeOptions,
    isInvalidInitialMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.selectStackAndMachine({
    defaultStackId,
    defaultMachineId: defaultMachineTypeId,
    availableStacks: stacks,
    availableMachineTypes: machines,
    hasDedicatedMachine: isDedicatedMachine,
    hasSelfHostedRunner: isSelfHostedRunner,
    selectedStackId: stackId,
    selectedMachineTypeId: machineTypeId,
    initialStackId: formState.defaultValues?.configuration?.stackId ?? '',
    initialMachineTypeId: formState.defaultValues?.configuration?.machineTypeId ?? '',
    isStackSelectorTouched,
    isMachineTypeSelectorTouched,
  });

  const isDefault = !selectedStack.id && !selectedMachineType.id;
  const shouldUpdateMachineType =
    isStackSelectorTouched && !isLoading && !isMachineTypeSelectionDisabled && !isInvalidInitialMachineType;

  useEffect(() => {
    if (shouldUpdateMachineType) {
      setValue('configuration.machineTypeId', selectedMachineType.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [shouldUpdateMachineType, selectedMachineType.id, setValue]);

  if (!appSlug) {
    return null;
  }

  return (
    <ExpandableCard
      buttonContent={
        <ButtonContent
          isDefault={isDefault}
          stackName={selectedStack.name}
          machineTypeName={selectedMachineType.name}
        />
      }
    >
      <Box display="flex" flexDir="column" gap="24">
        <Select
          isRequired
          label="Stack"
          isLoading={isLoading}
          errorText={isInvalidInitialStack ? 'Invalid stack' : undefined}
          {...register('configuration.stackId')}
        >
          {availableStackOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isLoading={isLoading}
          isDisabled={isMachineTypeSelectionDisabled}
          errorText={isInvalidInitialMachineType ? 'Invalid machine type' : undefined}
          {...register('configuration.machineTypeId')}
        >
          {availableMachineTypeOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Box>
    </ExpandableCard>
  );
};

export default StackAndMachineCard;
