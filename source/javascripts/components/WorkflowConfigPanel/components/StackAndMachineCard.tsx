import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../WorkflowConfigPanel.types';
import useStackAndMachine from '../hooks/useStackAndMachine';

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
    'configuration.stackId',
    'configuration.machineTypeId',
    'isMachineTypeSelectorAvailable',
  ]);

  const { isLoading, stack, defaultStack, stackOptions, machineType, defaultMachineType, machineTypeOptions } =
    useStackAndMachine({
      appSlug,
      selectedStackId,
      defaultStackId,
      selectedMachineTypeId,
      defaultMachineTypeId,
      canChangeMachineType: isMachineTypeSelectorAvailable,
    });

  const isDedicatedMachine = !isMachineTypeSelectorAvailable;
  const isSelfHostedRunner = !defaultMachineTypeId;
  const isMachineTypeSelectorDisabled = isDedicatedMachine || isSelfHostedRunner;
  const isDefault = !selectedStackId && !selectedMachineTypeId;

  if (!appSlug) {
    return null;
  }

  if (isLoading) {
    return (
      <ExpandableCard
        buttonContent={
          <ButtonContent stackName={stack?.title} machineTypeName={machineType?.name} isDefault={isDefault} />
        }
      />
    );
  }

  return (
    <ExpandableCard
      buttonContent={
        <ButtonContent stackName={stack?.title} machineTypeName={machineType?.name} isDefault={isDefault} />
      }
    >
      <Box display="flex" flexDir="column" gap="24">
        <Select label="Stack" {...register('configuration.stackId')} isRequired>
          <option value="">Default ({defaultStack?.title})</option>
          {stackOptions.map(({ value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </Select>
        <Select
          isRequired
          label="Machine type"
          isDisabled={isMachineTypeSelectorDisabled}
          {...register('configuration.machineTypeId')}
        >
          {isDedicatedMachine && <option value="">Dedicated Machine</option>}
          {isSelfHostedRunner && <option value="">Self-hosted Runner</option>}
          {!isDedicatedMachine && !isSelfHostedRunner && (
            <>
              <option value="">Default ({defaultMachineType?.name})</option>
              {machineTypeOptions.map(({ value, title }) => (
                <option key={value} value={value}>
                  {title}
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
