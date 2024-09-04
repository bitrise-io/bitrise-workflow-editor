import { useEffect, useMemo } from 'react';
import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import StackService from '@/core/models/StackService';
import MachineTypeService from '@/core/models/MachineTypeService';
import { FormValues } from '../WorkflowConfig.types';
import useStacksAndMachines from '../hooks/useStacksAndMachines';

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
  const { data, isLoading } = useStacksAndMachines();
  const { watch, register, setValue } = useFormContext<FormValues>();
  const [stackId, machineTypeId] = watch(['configuration.stackId', 'configuration.machineTypeId']);

  const stacks = useMemo(() => data?.availableStacks ?? [], [data?.availableStacks]);
  const machines = useMemo(() => data?.availableMachineTypes ?? [], [data?.availableMachineTypes]);

  const defaultStackId = data?.defaultStackId || '';
  const defaultMachineTypeId = data?.defaultMachineId || '';

  const isDefault = !stackId && !machineTypeId;
  const hasDedicatedMachine = Boolean(data?.hasDedicatedMachine);
  const hasSelfHostedRunner = Boolean(data?.hasSelfHostedRunner);
  const isMachineTypeSelectorDisabled = hasDedicatedMachine || hasSelfHostedRunner;

  // All stack is selectable all the time
  const defaultStack = StackService.getStackById(stacks, defaultStackId);
  const selectedStack = StackService.selectStack(stacks, stackId, defaultStackId);
  const stackOptions = useMemo(() => stacks.map(StackService.toStackOption), [stacks]);

  const selectableMachines = MachineTypeService.getMachinesOfStack(machines, selectedStack);
  const machineTypeOptions = selectableMachines.map(MachineTypeService.toMachineOption);
  const defaultMachine = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeId);
  const selectedMachine = MachineTypeService.selectMachineType(
    selectableMachines,
    machineTypeId,
    defaultMachineTypeId,
    isMachineTypeSelectorDisabled,
  );

  const isInvalidStackSelected = stackId && stacks.every((s) => s.id !== stackId);
  const isInvalidMachineSelected = machineTypeId && machines.every((m) => m.id !== machineTypeId);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const stack = StackService.selectStack(stacks, stackId, defaultStackId);
    if (isMachineTypeSelectorDisabled) {
      setValue('configuration.machineTypeId', '');
    } else if (stack?.machineTypes.length && !stack.machineTypes.includes(machineTypeId) && !isInvalidMachineSelected) {
      setValue('configuration.machineTypeId', !stackId || stackId === defaultStackId ? '' : stack.machineTypes[0]);
    }
  }, [
    stacks,
    stackId,
    setValue,
    isLoading,
    machineTypeId,
    defaultStackId,
    isInvalidMachineSelected,
    isMachineTypeSelectorDisabled,
  ]);

  return (
    <ExpandableCard
      buttonContent={
        <ButtonContent stackName={selectedStack?.name} machineTypeName={selectedMachine?.name} isDefault={isDefault} />
      }
    >
      <Box display="flex" flexDir="column" gap="24">
        <Select
          isRequired
          label="Stack"
          isLoading={isLoading}
          errorText={isInvalidStackSelected ? 'Invalid stack' : undefined}
          {...register('configuration.stackId')}
        >
          <option value="">Default ({defaultStack?.name})</option>
          {stackOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          {isInvalidStackSelected && <option value={stackId}>{stackId}</option>}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isLoading={isLoading}
          isDisabled={isMachineTypeSelectorDisabled}
          errorText={isInvalidMachineSelected ? 'Invalid machine type' : undefined}
          {...register('configuration.machineTypeId')}
        >
          {hasDedicatedMachine && <option value="">Dedicated Machine</option>}
          {hasSelfHostedRunner && <option value="">Self-hosted Runner</option>}
          {!hasDedicatedMachine && !hasSelfHostedRunner && (
            <>
              {defaultMachine && <option value="">Default ({defaultMachine.name})</option>}
              {machineTypeOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </>
          )}
          {isInvalidMachineSelected && <option value={machineTypeId}>{machineTypeId}</option>}
        </Select>
      </Box>
    </ExpandableCard>
  );
};

export default StackAndMachineCard;
