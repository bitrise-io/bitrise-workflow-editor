import { Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';
import useStackAndMachine from '../hooks/useStackAndMachine';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
};
const ButtonContent = ({ stackName, machineTypeName }: ButtonContentProps) => {
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
  const { watch, register } = useFormContext<FormValues>();

  const [
    appSlug = '',
    defaultStackId,
    defaultMachineTypeId,
    selectedStackId,
    selectedMachineTypeId,
    isMachineTypeSelectorAvailable,
  ] = watch([
    'appSlug',
    'defaultStackId',
    'defaultMachineTypeId',
    'configuration.stack',
    'configuration.machineType',
    'isMachineTypeSelectorAvailable',
  ]);

  const { isPending, stack, defaultStack, stackOptions, machineType, defaultMachineType, machineTypeOptions } =
    useStackAndMachine({
      appSlug,
      selectedStackId,
      defaultStackId,
      selectedMachineTypeId,
      defaultMachineTypeId,
      canChangeMachineType: isMachineTypeSelectorAvailable,
    });

  if (!appSlug) {
    return null;
  }

  if (isPending) {
    return (
      <ExpandableCard buttonContent={<ButtonContent stackName={stack?.title} machineTypeName={machineType?.name} />} />
    );
  }

  return (
    <ExpandableCard buttonContent={<ButtonContent stackName={stack?.title} machineTypeName={machineType?.name} />}>
      <Box display="flex" flexDir="column" gap="24">
        <Select label="Stack" {...register('configuration.stack')} isRequired>
          <option value="">{`Default (${defaultStack?.title})`}</option>
          {stackOptions.map(({ value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isDisabled={!isMachineTypeSelectorAvailable}
          {...register('configuration.machineType')}
        >
          <option value="">{`Default (${defaultMachineType?.name})`}</option>
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
