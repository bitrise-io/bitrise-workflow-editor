import { MachineType } from '../models/MachineType';
import { Stack } from '../models/Stack';

function getMachineById(machines: MachineType[], id?: string): MachineType | undefined {
  return machines.find((m) => m.id === id);
}

function getMachinesOfStack(machines: MachineType[], stack?: Stack): MachineType[] {
  if (!stack) {
    return [];
  }

  return machines.filter((m) => stack.machineTypes.includes(m.id));
}

function toMachineOption(machine: MachineType) {
  const {
    name,
    specs: {
      cpu: { cpuCount, cpuDescription },
      ram,
    },
    creditCost,
  } = machine;
  const label = `${name} ${cpuCount} @ ${cpuDescription} ${ram} (${creditCost} credits/min)`;

  return {
    value: machine.id,
    label,
  };
}

export default {
  getMachineById,
  getMachinesOfStack,
  toMachineOption,
};
