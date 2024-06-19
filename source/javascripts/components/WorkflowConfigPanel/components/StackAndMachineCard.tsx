import { useEffect } from 'react';
import { Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';
import useStackAndMachine from '../hooks/useStackAndMachine';

const ButtonContent = () => {
  const { watch } = useFormContext<FormValues>();

  const [appSlug, stack, machineType, isMachineTypeSelectorAvailable] = watch([
    'appSlug',
    'configuration.stack',
    'configuration.machineType',
    'isMachineTypeSelectorAvailable',
  ]);

  const { stackOptions, machineTypeOptions } = useStackAndMachine(appSlug, stack, isMachineTypeSelectorAvailable);

  const stackName = stackOptions.find((s) => s.value === stack)?.title || stack;
  const machineTypeName = machineTypeOptions.find((m) => m.value === machineType)?.name || machineType;

  return (
    <Box display="flex" flexDir="column" alignItems="flex-start" minW="0">
      <Text textStyle="body/lg/semibold">Stack & Machine</Text>
      <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
        {[stackName, machineTypeName].filter(Boolean).join(' • ')}
      </Text>
    </Box>
  );
};

const StackAndMachineCard = () => {
  const { watch, register, setValue } = useFormContext<FormValues>();

  const [appSlug, stack, machineType, isMachineTypeSelectorAvailable] = watch([
    'appSlug',
    'configuration.stack',
    'configuration.machineType',
    'isMachineTypeSelectorAvailable',
  ]);

  const { isPending, stackOptions, machineTypeOptions } = useStackAndMachine(
    appSlug,
    stack,
    isMachineTypeSelectorAvailable,
  );

  useEffect(() => {
    if (!isPending && machineTypeOptions.every((m) => m.value !== machineType)) {
      setValue('configuration.machineType', machineTypeOptions[0]?.value);
    }
  }, [isPending, machineType, machineTypeOptions, setValue]);

  if (!appSlug) {
    return null;
  }

  if (isPending) {
    return <ExpandableCard buttonContent={<ButtonContent />} />;
  }

  return (
    <ExpandableCard buttonContent={<ButtonContent />}>
      <Box display="flex" flexDir="column" gap="24">
        <Select label="Stack" {...register('configuration.stack')} isRequired>
          {stackOptions.map(({ value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isDisabled={!isMachineTypeSelectorAvailable || !machineType}
          {...register('configuration.machineType')}
        >
          {machineTypeOptions.map(({ value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </Select>
      </Box>
    </ExpandableCard>
  );
};

export default StackAndMachineCard;
