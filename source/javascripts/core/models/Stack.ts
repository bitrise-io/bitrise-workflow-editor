export type Stack = {
  id: string;
  name: string;
  description: string;
  descriptionUrl?: string;
  machineTypes: string[];
  rollbackVersion?: Record<string, { free?: string; paying?: string }>;
};

export type StackOption = {
  value: string;
  label: string;
};
