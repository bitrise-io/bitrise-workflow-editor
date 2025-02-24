export type MachineType = {
  id: string;
  name: string;
  specs: {
    cpu: {
      chip: string;
      cpuCount: string;
      cpuDescription: string;
    };
    ram: string;
  };
  creditCost: number;
};

export type MachineTypeOption = {
  value: string;
  label: string;
};
