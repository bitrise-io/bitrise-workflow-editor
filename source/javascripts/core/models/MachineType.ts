type MachineType = {
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

type MachineTypeOption = {
  value: string;
  label: string;
};

export { MachineType, MachineTypeOption };
