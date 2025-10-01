import { Avatar, Box, Dropdown, DropdownDetailedOption, DropdownGroup, Toggletip, TypeIconName } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import { MachineTypeOption, MachineTypeOptionGroup } from '@/core/models/StackAndMachine';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

const getIconName = (osId?: string): TypeIconName | undefined => {
  switch (osId) {
    case 'linux':
      return 'Linux';
    case 'osx':
    case 'macos':
      return 'Apple';
    default:
      return 'Cpu';
  }
};

const renderOptions = (machines: MachineTypeOption[], isDisabled?: boolean) => {
  return machines.map((machine) => {
    const iconName = getIconName(machine.os);
    return (
      <DropdownDetailedOption
        key={machine.value}
        value={machine.value}
        title={machine.label}
        subtitle=""
        isDisabled={isDisabled}
        icon={iconName && <Avatar variant="brand" size="24" iconName={iconName} />}
      />
    );
  });
};

type Props = {
  isLoading: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  machineType: MachineTypeWithValue;
  optionGroups: MachineTypeOptionGroup[];
  onChange: (machineId: string) => void;
};

const MachineTypeSelector = ({ isLoading, isInvalid, isDisabled, machineType, optionGroups, onChange }: Props) => {
  const toggletip = (icon: ReactNode) => {
    if (!optionGroups.find((group) => group.status === 'promoted')) {
      return null;
    }

    return (
      <Toggletip
        label="Select your machine type for builds. Options vary by plan. For stronger machines, please contact sales."
        button={{ href: 'https://bitrise.io/demo', label: 'Reach out to sales' }}
      >
        <Box maxH="20px" mt="-4px">
          {icon}
        </Box>
      </Toggletip>
    );
  };

  return (
    <Dropdown
      flex="1"
      required
      search={false}
      label="Machine type"
      labelHelp={toggletip}
      dropdownMaxHeight="25rem"
      disabled={isLoading || isDisabled}
      isError={isInvalid}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
      value={machineType.value}
      onChange={(e) => onChange(e.target.value ?? '')}
    >
      {optionGroups.length === 1 && renderOptions(optionGroups[0].options)}
      {optionGroups.length > 1 && (
        <>
          {optionGroups.map((group) => (
            <DropdownGroup key={group.label} label={group.label} labelProps={{ whiteSpace: 'nowrap' }}>
              {renderOptions(group.options, group.status === 'promoted')}
            </DropdownGroup>
          ))}
        </>
      )}
    </Dropdown>
  );
};

export default MachineTypeSelector;
