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

export type MachineOS = StackOS;

export enum MachineRegionName {
  US = 'US',
  EU = 'EU',
}

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
  isDisabled: boolean;
  availableInRegions: Partial<Record<MachineRegionName, string>>;
  availableOnStacks?: string[];
};

export type MachineTypeGroup = {
  label: string;
  machines: MachineType[];
};

export type MachineTypeOption = {
  value: string;
  isDisabled: boolean;
  title: string;
  subtitle: string;
  os: MachineOS;
};

export type MachineTypeOptionGroup = {
  label: string;
  options: MachineTypeOption[];
};
