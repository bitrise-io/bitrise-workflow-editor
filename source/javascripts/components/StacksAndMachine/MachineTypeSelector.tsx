import { Dropdown, DropdownDetailedOption, DropdownGroup, DropdownProps, Text, Toggletip } from '@bitrise/bitkit';
import { BitkitAvatar, BitkitIconComponent, IconApple, IconCpu, IconLinux } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ReactNode, useMemo } from 'react';

import { MachineRegionName, MachineTypeOption, MachineTypeOptionGroup } from '@/core/models/StackAndMachine';
import { doesHardwareVaryByRegion, MachineTypeWithValue } from '@/core/services/StackAndMachineService';

const getIcon = (osId?: string): BitkitIconComponent => {
  switch (osId) {
    case 'linux':
      return IconLinux;
    case 'osx':
    case 'macos':
      return IconApple;
    default:
      return IconCpu;
  }
};

const renderOptions = (machineTypeOptions: MachineTypeOption[]) => {
  return machineTypeOptions.map((props) => {
    const icon = getIcon(props.os);

    return <DropdownDetailedOption {...props} key={props.value} icon={<BitkitAvatar variant="icon" icon={icon} />} />;
  });
};

const renderFormLabel = (machineTypeOption: MachineTypeOption) => {
  const { title, os } = machineTypeOption;
  const icon = getIcon(os);

  return (
    <Box display="flex" gap="12" alignItems="center">
      <BitkitAvatar variant="icon" icon={icon} size="24" />
      {title}
    </Box>
  );
};

type Props = Pick<DropdownProps<string | null>, 'width'> & {
  isLoading: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  machineType: MachineTypeWithValue;
  optionGroups: MachineTypeOptionGroup[];
  onChange: (machineId: string) => void;
  selectedRegion?: MachineRegionName;
};

const MachineTypeSelector = ({
  isLoading,
  isInvalid,
  isDisabled,
  machineType,
  optionGroups,
  onChange,
  selectedRegion,
  ...boxProps
}: Props) => {
  const doesHardwareVaryByRegionForSelectedMachineType = useMemo(
    () => doesHardwareVaryByRegion(machineType),
    [machineType],
  );

  const toggletip = (icon: ReactNode) => {
    if (!optionGroups.find((group) => group.options.find((option) => option.isDisabled))) {
      return null;
    }

    return (
      <Toggletip
        label="Select your machine type for builds. Options vary by plan. For stronger machines, please contact sales."
        button={{ href: 'https://bitrise.io/demo', label: 'Reach out to sales' }}
      >
        <Box maxHeight="20px" marginBlockStart="-4px">
          {icon}
        </Box>
      </Toggletip>
    );
  };

  const helperText = () => {
    if (doesHardwareVaryByRegionForSelectedMachineType && !selectedRegion) {
      return (
        <Box as="span" display="flex" flexDirection="column" gap="8">
          <Text as="span">Machine types may vary depending on high demand.</Text>
          {Object.entries(machineType.availableInRegions).map(([regionName, texts]) => {
            return (
              <Text as="span" color="input/text/helper" key={regionName} textStyle="body/sm/regular">
                <Text as="span" fontWeight="bold">
                  {regionName}:
                </Text>{' '}
                {texts?.join(' • ')}
              </Text>
            );
          })}
        </Box>
      );
    }

    const region = selectedRegion || (Object.keys(machineType.availableInRegions)[0] as MachineRegionName);

    return (
      <Text as="span" color="input/text/helper" textStyle="body/sm/regular">
        {machineType.availableInRegions[region]?.join(' • ')}
      </Text>
    );
  };

  let selectedOption: MachineTypeOption | null = null;
  optionGroups.find((group) => {
    const option = group.options.find(({ value }) => value === machineType.value);
    if (option) {
      selectedOption = option;
      return true;
    }
  });

  return (
    <Dropdown
      size="md"
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
