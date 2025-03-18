import { Box, Select } from '@bitrise/bitkit';

import { MachineTypeOption } from '@/core/models/MachineType';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

type Props = {
  options: MachineTypeOption[];
  machineType: MachineTypeWithValue;
  onChange: (machineId: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
};

const MachineTypeSelector = ({ machineType, options, isLoading, isDisabled, isInvalid, onChange }: Props) => {
  return (
    <Box flex="1">
      <Select
        isRequired
        label="Machine type"
        isLoading={isLoading}
        value={machineType.value}
        isDisabled={isDisabled}
        errorText={isInvalid ? 'Invalid machine type' : undefined}
        helperText={`${machineType.creditPerMinute} credits/min`}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default MachineTypeSelector;
