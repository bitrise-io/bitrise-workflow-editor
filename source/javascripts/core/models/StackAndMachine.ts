export type StackStatus = 'edge' | 'stable' | 'frozen' | 'unknown';

export const STACK_STATUS_MAPPING: Record<
  StackStatus,
  {
    label: string;
    order: number;
  }
> = {
  edge: { label: 'Edge Stacks', order: 1 },
  stable: { label: 'Stable Stacks', order: 2 },
  unknown: { label: 'Uncategorized', order: 3 },
  frozen: { label: 'Frozen Stacks', order: 4 },
};

export type Stack = {
  id: string;
  name: string;
  status: StackStatus;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, { free?: string; paying?: string }>;
  os: 'macos' | 'linux' | 'unknown';
};

export type StackOption = {
  value: string;
  label: string;
  status: StackStatus;
};

export type StackGroup = {
  label: string;
  status: StackStatus;
  options: StackOption[];
};

export type MachineType = {
  availableOnStacks: string[];
  id: string;
  name: string;
  ram: string;
  chip: string;
  cpuCount: string;
  cpuDescription: string;
  creditPerMinute?: number;
  osId: string;
};

export type MachineTypeOption = {
  osId?: string;
  value: string;
  label: string;
};
