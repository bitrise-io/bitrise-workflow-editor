import { Stack } from '@/core/models/Stack';
import { Meta } from '@/core/models/BitriseYml';
import { WorkflowYmlObject } from '@/core/models/Workflow';
import { MachineType } from '@/core/models/MachineType';

function getMachineById(machines: MachineType[], id?: string): MachineType | undefined {
  return machines.find((m) => m.id === id);
}

function getMachinesOfStack(machines: MachineType[], stack?: Stack): MachineType[] {
  if (!stack) {
    return [];
  }

  return machines.filter((m) => stack.machineTypes.includes(m.id));
}

function getMachineFromMeta(machines: MachineType[], meta?: Meta): MachineType | undefined {
  if (!meta) {
    return undefined;
  }

  const machineId = meta['bitrise.io']?.machine_type_id;
  return getMachineById(machines, machineId);
}

function getMachineOfWorkflow({
  machines,
  workflow,
  meta,
}: {
  machines: MachineType[];
  workflow: WorkflowYmlObject;
  meta: Meta;
}): MachineType | undefined {
  const workflowMachine = getMachineFromMeta(machines, workflow.meta);
  return workflowMachine || getMachineFromMeta(machines, meta);
}

// Machine type selection depends on whether the requested machine type is available on the selected stack
function selectMachineType(
  selectableMachines: MachineType[],
  selectedMachineTypeId: string,
  defaultMachineTypeId: string,
  isSelectionDisabled: boolean,
): MachineType | undefined {
  if (isSelectionDisabled) {
    return undefined;
  }

  // - If the selected machine type is available, returns the selectedMachineTypeId, and the corresponding machine
  const requestedMachine = getMachineById(selectableMachines, selectedMachineTypeId);
  if (requestedMachine) {
    return requestedMachine;
  }

  // - If the selected machine type is not available, but the default machine type is available, returns '' and the default machine
  const defaultMachine = getMachineById(selectableMachines, defaultMachineTypeId);
  if (defaultMachine) {
    return { ...defaultMachine, id: '' };
  }

  // - If the both the selected machine type and the default machine type are not available, returns the first selectable machine's id and the first selectable machine
  const firstMachine = selectableMachines[0];
  if (firstMachine) {
    return firstMachine;
  }

  return undefined;
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
  getMachineFromMeta,
  getMachineOfWorkflow,
  selectMachineType,
  toMachineOption,
};
