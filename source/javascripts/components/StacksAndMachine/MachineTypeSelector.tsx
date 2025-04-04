import { Select } from '@bitrise/bitkit';

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
    <Select
      isRequired
      label="Machine type"
      isLoading={isLoading}
      value={machineType.value}
      isDisabled={isDisabled}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
      onChange={(e) => onChange(e.target.value)}
      flex="1"
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
};

export default MachineTypeSelector;
