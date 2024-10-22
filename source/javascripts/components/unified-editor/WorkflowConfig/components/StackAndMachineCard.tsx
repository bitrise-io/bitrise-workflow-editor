import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';
import StackAndMachineService from '@/core/models/StackAndMachineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useStacksAndMachines from '../hooks/useStacksAndMachines';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

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
  const workflow = useWorkflowConfigContext();
  const { data, isLoading } = useStacksAndMachines();
  const updateStackAndMachine = useBitriseYmlStore((s) => s.updateStackAndMachine);

  const {
    selectedStack,
    selectedMachineType,
    availableStackOptions,
    availableMachineTypeOptions,
    isInvalidInitialStack,
    isInvalidInitialMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.selectStackAndMachine({
    ...data,
    initialStackId: workflow?.userValues.meta?.['bitrise.io']?.stack ?? '',
    selectedStackId: workflow?.userValues.meta?.['bitrise.io']?.stack ?? '',
    initialMachineTypeId: workflow?.userValues.meta?.['bitrise.io']?.machine_type_id ?? '',
    selectedMachineTypeId: workflow?.userValues.meta?.['bitrise.io']?.machine_type_id ?? '',
  });

  const isDefault = !selectedStack.id && !selectedMachineType.id;

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
          value={selectedStack.id}
          errorText={isInvalidInitialStack ? 'Invalid stack' : undefined}
          onChange={(e) => updateStackAndMachine(workflow?.id || '', e.target.value, selectedMachineType.id)}
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
          value={selectedMachineType.id}
          isDisabled={isMachineTypeSelectionDisabled}
          errorText={isInvalidInitialMachineType ? 'Invalid machine type' : undefined}
          onChange={(e) => updateStackAndMachine(workflow?.id || '', selectedStack.id, e.target.value)}
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
