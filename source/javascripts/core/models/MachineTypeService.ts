import { Stack } from '@/core/models/Stack';
import { Meta } from '@/core/models/BitriseYml';
import { WorkflowYmlObject } from '@/core/models/Workflow';
import { MachineType } from '@/core/models/MachineType';

function getMachineById(machines: MachineType[], id?: string): MachineType | undefined {
  return machines.find((m) => m.id === id);
}

function hasStackOnMachine(stack: Stack, machineId: string): boolean {
  return stack.machineTypes.includes(machineId);
}

function getMachinesOfStack(machines: MachineType[], stack?: Stack): MachineType[] {
  if (!stack) {
    return machines;
  }

  return machines.filter((m) => hasStackOnMachine(stack, m.id));
}

function getMachineFromMeta(machines: MachineType[], meta?: Meta): MachineType | undefined {
  if (!meta) {
    return undefined;
  }

  const machineId = meta['bitrise.io']?.machine_type_id;
  return getMachineById(machines, machineId);
}

function getDefaultMachineOfProject(machines: MachineType[], meta: Meta): MachineType | undefined {
  return getMachineFromMeta(machines, meta);
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
  return workflowMachine || getDefaultMachineOfProject(machines, meta);
}

function toMachineOption(machine: MachineType) {
  return {
    value: machine.id,
    name: machine.name || machine.id,
    label: machine.label,
  };
}

export default {
  getMachineById,
  getMachinesOfStack,
  getDefaultMachineOfProject,
  getMachineOfWorkflow,
  toMachineOption,
};
