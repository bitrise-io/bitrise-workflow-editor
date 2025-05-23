export type MachineType = {
  id: string;
  name: string;
  ram: string;
  chip: string;
  cpuCount: string;
  cpuDescription: string;
  creditPerMinute?: number;
};

export type MachineTypeOption = {
  value: string;
  label: string;
};
