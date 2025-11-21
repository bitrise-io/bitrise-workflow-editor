export type StackStatus = 'edge' | 'stable' | 'frozen' | 'unknown';
export type StackOS = 'macos' | 'linux' | 'unknown';

export type Stack = {
  id: string;
  os: StackOS;
  name: string;
  status: StackStatus;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, { free?: string; paying?: string }>;
};

export type StackGroup = {
  label: string;
  status: StackStatus;
  stacks: Stack[];
};

export type StackOption = {
  value: string;
  label: string;
  status: StackStatus;
  os?: string;
};

export type StackOptionGroup = {
  label: string;
  status: StackStatus;
  options: StackOption[];
};

export type MachineStatus = 'available' | 'promoted' | 'unknown';
export type MachineOS = StackOS;

export type MachineTypeInfo = {
  cpuCount: string;
  cpuDescription: string;
  name: string;
  ram: string;
};

export type MachineType = {
  id: string;
  creditPerMinute?: number;
  os: MachineOS;
  name: string;
  isPromoted: boolean;
  availableInRegions: Record<string, MachineTypeInfo>;
  availableOnStacks?: string[];
};

export type MachineTypeGroup = {
  label: string;
  status: MachineStatus;
  machines: MachineType[];
};

export type MachineTypeOption = {
  os?: string;
  value: string;
  label: string;
  status: MachineStatus;
};

export type MachineTypeOptionGroup = {
  label: string;
  status: MachineStatus;
  options: MachineTypeOption[];
};
