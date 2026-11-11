import {
  BitkitIconComponent,
  BitkitLink,
  BitkitSelect,
  type BitkitSelectProps,
  IconApple,
  IconCpu,
  IconLinux,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useMemo } from 'react';

import { MachineRegionName, MachineTypeOptionGroup } from '@/core/models/StackAndMachine';
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

// A machine whose hardware differs by region lists one region per line.
const toHelperText = (subtitle: string) =>
  subtitle.includes('\n')
    ? subtitle.split('\n').map((line) => (
        <Text as="span" display="block" key={line}>
          {line}
        </Text>
      ))
    : subtitle;

const toItems = (optionGroups: MachineTypeOptionGroup[]) =>
  optionGroups.flatMap((group) =>
    group.options.map((option) => ({
      disabled: option.isDisabled,
      group: optionGroups.length > 1 ? group.label : undefined,
      helperText: option.subtitle ? toHelperText(option.subtitle) : undefined,
      icon: getIcon(option.os),
      label: option.title,
      value: option.value,
    })),
  );

type Props = Pick<BitkitSelectProps, 'width'> & {
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

  const hasUnavailableMachines = optionGroups.some((group) => group.options.some((option) => option.isDisabled));

  const helperText = () => {
    if (doesHardwareVaryByRegionForSelectedMachineType && !selectedRegion) {
      return (
        <Box as="span" display="flex" flexDirection="column" gap="8">
          <Text as="span">Machine types may vary depending on high demand.</Text>
          {Object.entries(machineType.availableInRegions).map(([regionName, texts]) => {
            return (
              <Text as="span" color="text/helper" key={regionName} textStyle="body/sm/regular">
                <strong>{regionName}:</strong> {texts?.join(' • ')}
              </Text>
            );
          })}
        </Box>
      );
    }

    const region = selectedRegion || (Object.keys(machineType.availableInRegions)[0] as MachineRegionName);

    return (
      <Text as="span" color="text/helper" textStyle="body/sm/regular">
        {machineType.availableInRegions[region]?.join(' • ')}
      </Text>
    );
  };

  return (
    <BitkitSelect
      {...boxProps}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      flex="1"
      helperText={
        <>
          {helperText()}
          {hasUnavailableMachines && (
            <Text as="span" display="block">
              <BitkitLink href="https://bitrise.io/demo" isExternal>
                Reach out to sales
              </BitkitLink>
            </Text>
          )}
        </>
      }
      items={toItems(optionGroups)}
      label="Machine type"
      state={isLoading || isDisabled ? 'disabled' : undefined}
      tooltip={
        hasUnavailableMachines
          ? 'Select your machine type for builds. Options vary by plan. For stronger machines, please contact sales.'
          : undefined
      }
      value={machineType.value}
      onValueChange={(value) => onChange(value ?? '')}
    />
  );
};

export default MachineTypeSelector;
