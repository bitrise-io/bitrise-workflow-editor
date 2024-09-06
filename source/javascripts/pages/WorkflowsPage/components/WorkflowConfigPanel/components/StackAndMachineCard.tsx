import { useEffect, useMemo } from 'react';
import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useStacks from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/hooks/useStacks';
import useMachineTypes from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/hooks/useMachineTypes';
import StackService from '@/core/models/StackService';
import MachineTypeService from '@/core/models/MachineTypeService';
import { FormValues } from '../WorkflowConfigPanel.types';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
  isDefault?: boolean;
};
const ButtonContent = ({ stackName, machineTypeName, isDefault }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" mr="16">
      <Box display="flex" flexDir="column" alignItems="flex-start" minW="0">
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
  const { watch, register, setValue } = useFormContext<FormValues>();

  const [appSlug = '', defaultStackId, defaultMachineTypeId, stackId, machineTypeId, canChangeMachineType] = watch([
    'appSlug',
    'defaultStackId',
    'defaultMachineTypeId',
    'configuration.stackId',
    'configuration.machineTypeId',
    'isMachineTypeSelectorAvailable',
  ]);

  const isDefault = !stackId && !machineTypeId;
  const isDedicatedMachine = !canChangeMachineType;
  const isSelfHostedRunner = !defaultMachineTypeId;
  const isMachineTypeSelectorDisabled = isDedicatedMachine || isSelfHostedRunner;

  const { isLoading: isStacksLoading, data: stacks = [] } = useStacks({
    appSlug,
  });

  // All stack is selectable all the time
  const defaultStack = StackService.getStackById(stacks, defaultStackId);
  const selectedStack = StackService.selectStack(stacks, stackId, defaultStackId);
  const stackOptions = useMemo(() => stacks.map(StackService.toStackOption), [stacks]);

  const { isLoading: isMachinesLoading, data: machines = [] } = useMachineTypes({
    appSlug,
    canChangeMachineType,
  });

  const selectableMachines = MachineTypeService.getMachinesOfStack(machines, selectedStack);
  const machineTypeOptions = selectableMachines.map(MachineTypeService.toMachineOption);
  const defaultMachine = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeId);
  const selectedMachine = MachineTypeService.selectMachineType(
    selectableMachines,
    machineTypeId,
    defaultMachineTypeId,
    isMachineTypeSelectorDisabled,
  );
  const isLoading = isStacksLoading || isMachinesLoading;

  useEffect(() => {
    if (selectedStack && stackId !== selectedStack.id) {
      setValue('configuration.stackId', selectedStack.id);
    }
  }, [stackId, selectedStack, setValue]);

  useEffect(() => {
    if (isMachineTypeSelectorDisabled) {
      return;
    }

    if (selectedMachine && machineTypeId !== selectedMachine.id) {
      setValue('configuration.machineTypeId', selectedMachine.id);
    }
  }, [isMachineTypeSelectorDisabled, setValue, machineTypeId, selectedMachine]);

  if (!appSlug) {
    return null;
  }

  return (
    <ExpandableCard
      buttonContent={
        <ButtonContent stackName={selectedStack?.name} machineTypeName={selectedMachine?.name} isDefault={isDefault} />
      }
    >
      <Box display="flex" flexDir="column" gap="24">
        <Select
          label="Stack"
          value={selectedStack?.id}
          {...register('configuration.stackId')}
          isRequired
          isLoading={isLoading}
        >
          <option value="">Default ({defaultStack?.name})</option>
          {stackOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isLoading={isLoading}
          isDisabled={isMachineTypeSelectorDisabled}
          value={selectedMachine?.id}
          {...register('configuration.machineTypeId')}
        >
          {isDedicatedMachine && <option value="">Dedicated Machine</option>}
          {isSelfHostedRunner && <option value="">Self-hosted Runner</option>}
          {!isDedicatedMachine && !isSelfHostedRunner && (
            <>
              {defaultMachine && <option value="">Default ({defaultMachine.name})</option>}
              {machineTypeOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </>
          )}
        </Select>
      </Box>
    </ExpandableCard>
  );
};

export default StackAndMachineCard;
