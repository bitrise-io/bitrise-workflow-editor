export type Stack = {
  id: string;
  name: string;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, unknown>;
};

export type StackOption = {
  value: string;
  label: string;
};
