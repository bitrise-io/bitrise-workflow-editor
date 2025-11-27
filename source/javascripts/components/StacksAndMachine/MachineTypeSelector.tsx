import {
  Avatar,
  Box,
  BoxProps,
  Dropdown,
  DropdownDetailedOption,
  DropdownGroup,
  Text,
  Toggletip,
  TypeIconName,
} from '@bitrise/bitkit';
import { ReactNode, useMemo } from 'react';

import { MachineTypeOption, MachineTypeOptionGroup } from '@/core/models/StackAndMachine';
import { machineTypeHardwareVariesByRegion, MachineTypeWithValue } from '@/core/services/StackAndMachineService';

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

const renderOptions = (machineTypeOptions: MachineTypeOption[]) => {
  return machineTypeOptions.map(({ machineType, value, label }) => {
    const iconName = getIconName(machineType.os);

    let subtitle = '';
    if (machineTypeHardwareVariesByRegion(machineType)) {
      subtitle = Object.entries(machineType.availableInRegions)
        .map(([regionName, machineTypeInfoText]) => {
          return `${regionName}: ${machineTypeInfoText}`;
        })
        .join(`\n`);
    } else if (Object.values(machineType.availableInRegions).length > 0) {
      subtitle = Object.values(machineType.availableInRegions)[0];
    }

    return (
      <DropdownDetailedOption
        key={value}
        value={value}
        title={label}
        subtitle={subtitle}
        isDisabled={machineType.isPromoted}
        icon={iconName && <Avatar variant="brand" size="32" iconName={iconName} />}
      />
    );
  });
};

const renderFormLabel = (machineTypeOption: MachineTypeOption) => {
  const { label, machineType } = machineTypeOption;
  const iconName = getIconName(machineType.os);

  return (
    <Box display="flex" gap={12} alignItems="center">
      {iconName && <Avatar variant="brand" size="24" iconName={iconName} />}
      {label}
    </Box>
  );
};

type Props = Pick<BoxProps, 'width'> & {
  isLoading: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  machineType: MachineTypeWithValue;
  optionGroups: MachineTypeOptionGroup[];
  onChange: (machineId: string) => void;
};

const MachineTypeSelector = ({
  isLoading,
  isInvalid,
  isDisabled,
  machineType,
  optionGroups,
  onChange,
  ...boxProps
}: Props) => {
  const hardwareVariesByRegion = useMemo(() => machineTypeHardwareVariesByRegion(machineType), [machineType]);

  const toggletip = (icon: ReactNode) => {
    if (!optionGroups.find((group) => group.options.find((option) => option.isDisabled))) {
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

  const helperText = () => {
    if (!Object.values(machineType.availableInRegions)[0]) {
      return '';
    }

    if (hardwareVariesByRegion) {
      return (
        <Box as="span" display="flex" flexDir="column" gap={8}>
          <Text as="span">Machine types may vary depending on high demand.</Text>
          {Object.entries(machineType.availableInRegions).map(([regionName, machineTypeInfoText]) => {
            return (
              <Text as="span" color="input/text/helper" key={regionName} textStyle="body/sm/regular">
                <Text as="span" fontWeight="bold">
                  {regionName}:
                </Text>{' '}
                {machineTypeInfoText}
              </Text>
            );
          })}
        </Box>
      );
    }

    return (
      <Text as="span" color="input/text/helper" textStyle="body/sm/regular">
        {Object.values(machineType.availableInRegions)[0]}
      </Text>
    );
  };

  let selectedOption: MachineTypeOption | null = null;
  optionGroups.forEach((group) => {
    group.options.forEach((option) => {
      if (option.value !== machineType.value) {
        return;
      }

      selectedOption = option;
      return;
    });
  });

  return (
    <Dropdown
      {...boxProps}
      flex="1"
      formLabel={selectedOption && renderFormLabel(selectedOption)}
      required
      search={false}
      label="Machine type"
      labelHelp={toggletip}
      dropdownMaxHeight="25rem"
      disabled={isLoading || isDisabled}
      isError={isInvalid}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={helperText()}
      value={machineType.value}
      onChange={(e) => onChange(e.target.value ?? '')}
    >
      {optionGroups.length === 1 && renderOptions(optionGroups[0].options)}
      {optionGroups.length > 1 && (
        <>
          {optionGroups.map((group) => (
            <DropdownGroup key={group.label} label={group.label} labelProps={{ whiteSpace: 'nowrap' }}>
              {renderOptions(group.options)}
            </DropdownGroup>
          ))}
        </>
      )}
    </Dropdown>
  );
};

export default MachineTypeSelector;
