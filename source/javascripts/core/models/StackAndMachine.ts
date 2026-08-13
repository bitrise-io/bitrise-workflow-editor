export type StackStatus = 'edge' | 'stable' | 'frozen' | 'unknown';
export type StackOS = 'macos' | 'linux' | 'unknown';

/** The workspace's pricing tier, which the available stack versions depend on. */
export type StackVersionTier = 'free' | 'paying';

/** The versions of a stack published for a single exact machine type. */
export type StackVersions = {
  /** Absent when the stack is not available on the exact machine type at all. */
  latestVersion?: string;
  /** Absent when there is no rollback option, e.g. the stack hasn't been updated recently. */
  rollbackVersion?: string;
};

export type Stack = {
  id: string;
  os: StackOS;
  name: string;
  status: StackStatus;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, { free?: string; paying?: string }>;
  /** Stack versions per pricing tier, keyed by exact machine type ID. */
  availableOnMachines?: Partial<Record<StackVersionTier, Record<string, StackVersions>>>;
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
  name: string;
  ram: string;
};

export type MachineType = {
  id: string;
  creditPerMinute?: number;
  os: MachineOS;
  name: string;
  isDisabled: boolean;
  availableInRegions: Partial<Record<MachineRegionName, string[]>>;
  availableOnStacks?: string[];
  /**
   * The exact machine types a machine resource class can schedule builds onto. Empty for exact
   * machine types, which only stand for themselves.
   */
  exactMachineTypeIds?: string[];
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
