import { useMemo } from 'react';
import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import StackAndMachineService from '@/core/models/StackAndMachineService';
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
  const { register, formState, watch, setValue } = useFormContext<FormValues>();
  const [selectedStackId, selectedMachineTypeId] = watch(['configuration.stackId', 'configuration.machineTypeId']);

  const selectStackAndMachineProps = useMemo(() => {
    return {
      ...data,
      selectedStackId,
      selectedMachineTypeId,
      initialStackId: formState.defaultValues?.configuration?.stackId ?? '',
      initialMachineTypeId: formState.defaultValues?.configuration?.machineTypeId ?? '',
    };
  }, [
    data,
    selectedStackId,
    selectedMachineTypeId,
    formState.defaultValues?.configuration?.stackId,
    formState.defaultValues?.configuration?.machineTypeId,
  ]);

  const result = useMemo(() => {
    const { selectedMachineType, ...rest } = StackAndMachineService.selectStackAndMachine(selectStackAndMachineProps);

    setValue('configuration.machineTypeId', selectedMachineType.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    return { selectedMachineType, ...rest };
  }, [selectStackAndMachineProps, setValue]);

  const isDefault = !result.selectedStack.id && !result.selectedMachineType.id;

  return (
    <ExpandableCard
      buttonContent={
        <ButtonContent
          isDefault={isDefault}
          stackName={result.selectedStack.name}
          machineTypeName={result.selectedMachineType.name}
        />
      }
    >
      <Box display="flex" flexDir="column" gap="24">
        <Select
          isRequired
          label="Stack"
          isLoading={isLoading}
          errorText={result.isInvalidInitialStack ? 'Invalid stack' : undefined}
          {...register('configuration.stackId')}
        >
          {result.availableStackOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isLoading={isLoading}
          isDisabled={result.isMachineTypeSelectionDisabled}
          errorText={result.isInvalidInitialMachineType ? 'Invalid machine type' : undefined}
          {...register('configuration.machineTypeId')}
        >
          {result.availableMachineTypeOptions.map(({ value, label }) => (
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
