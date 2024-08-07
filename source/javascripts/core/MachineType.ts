import StackService, { Stack } from './Stack';
import { Meta } from './BitriseYml';
import { Workflow } from './Workflow';
import { WithId } from './WithId';

type MachineTypeObject = {
  name: string;
  label: string;
  os: string;
  spec: {
    cpu: {
      chip: string;
      count: string;
      description: string;
    };
    ram: string;
  };
  creditCost: number;
  isDefaultForOs: boolean;
};

type MachineType = WithId<MachineTypeObject>;

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

function getDefaultMachineOfStack(machines: MachineType[], stack?: Stack): MachineType | undefined {
  if (!stack) {
    return undefined;
  }

  const stackOs = StackService.getOsOfStack(stack);
  return machines.find((m) => m.isDefaultForOs && m.os === stackOs);
}

function getMachineOfWorkflow({
  machines,
  workflow,
  meta,
}: {
  machines: MachineType[];
  workflow: Workflow;
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

export { MachineType };
export default {
  getMachineById,
  getMachinesOfStack,
  getDefaultMachineOfProject,
  getDefaultMachineOfStack,
  getMachineOfWorkflow,
  toMachineOption,
};
