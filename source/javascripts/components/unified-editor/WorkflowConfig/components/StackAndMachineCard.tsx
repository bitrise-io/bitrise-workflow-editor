import { Badge, Box, ExpandableCard, Select, Text } from '@bitrise/bitkit';

import StackAndMachineService from '@/core/services/StackAndMachineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
  isDefault?: boolean;
};
const ButtonContent = ({ stackName, machineTypeName, isDefault }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" minW={0}>
      <Box display="flex" flexDir="column" alignItems="flex-start" minW={0}>
        <Text textStyle="body/lg/semibold">Stack & Machine</Text>
        <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
          {[stackName, machineTypeName].filter(Boolean).join(' • ')}
        </Text>
      </Box>
      {isDefault && (
        <Badge variant="subtle" colorScheme="info" mr="16">
          Default
        </Badge>
      )}
    </Box>
  );
};

const StackAndMachineCard = () => {
  const workflow = useWorkflowConfigContext();
  const { projectMachineTypeId, projectStackId } = useProjectStackAndMachine();
  const { data, isLoading } = useStacksAndMachines();
  const updateWorkflowMeta = useBitriseYmlStore((s) => s.updateWorkflowMeta);

  const {
    selectedStack,
    selectedMachineType,
    availableStackOptions,
    availableMachineTypeOptions,
    isInvalidStack,
    isInvalidMachineType,
    isMachineTypeSelectionDisabled,
  } = StackAndMachineService.prepareStackAndMachineSelectionData({
    ...data,
    selectedStackId: workflow?.userValues.meta?.['bitrise.io']?.stack ?? '',
    selectedMachineTypeId: workflow?.userValues.meta?.['bitrise.io']?.machine_type_id ?? '',
    projectStackId,
    projectMachineTypeId,
  });

  const isDefault = !selectedStack.id && !selectedMachineType.id;

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
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
          value={selectedStack.value}
          errorText={isInvalidStack ? 'Invalid stack' : undefined}
          onChange={(e) => {
            const { stackId, machineTypeId } = StackAndMachineService.changeStackAndMachine({
              stackId: e.target.value,
              machineTypeId: selectedMachineType.value,
              projectStackId,
              availableStacks: data?.availableStacks || [],
              availableMachineTypes: data?.availableMachineTypes || [],
            });
            updateWorkflowMeta(workflow?.id || '', {
              stack: stackId,
              machine_type_id: machineTypeId,
            });
          }}
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
          value={selectedMachineType.value}
          isDisabled={isMachineTypeSelectionDisabled}
          errorText={isInvalidMachineType ? 'Invalid machine type' : undefined}
          onChange={(e) => {
            const { stackId, machineTypeId } = StackAndMachineService.changeStackAndMachine({
              stackId: selectedStack.value,
              machineTypeId: e.target.value,
              projectStackId,
              availableStacks: data?.availableStacks || [],
              availableMachineTypes: data?.availableMachineTypes || [],
            });
            updateWorkflowMeta(workflow?.id || '', {
              stack: stackId,
              machine_type_id: machineTypeId,
            });
          }}
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
