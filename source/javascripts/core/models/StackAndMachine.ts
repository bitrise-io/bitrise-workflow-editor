export type StackStatus = 'edge' | 'stable' | 'frozen' | 'unknown';

export type Stack = {
  id: string;
  name: string;
  status: StackStatus;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, { free?: string; paying?: string }>;
};

export type StackOption = {
  value: string;
  label: string;
  status: StackStatus;
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

export type DeprecatedMachinesReplacementConfig = {
  gracePeriodStartedAt: string;
  gracePeriodEndedAt: string;
};
