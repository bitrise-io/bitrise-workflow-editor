import { useQuery } from '@tanstack/react-query';
import { getAllStackInfoQueryOptions } from '../services/getAllStackInfo';
import { MachineTypeConfigs, getMachineTypeConfigsQueryOptions } from '../services/getMachineTypeConfigs';

type MachineType = MachineTypeConfigs['available_machine_type_configs'][string]['machine_types'][string];
type MachineTypeWithKey = Partial<MachineType> & { key: string };

const findMachineTypeByKey = (machineTypeKey: string, machineTypeConfigs?: MachineTypeConfigs) => {
  let result: MachineType | undefined;

  Object.values(machineTypeConfigs?.available_machine_type_configs ?? {}).forEach(({ machine_types }) => {
    result ??= machine_types[machineTypeKey];
  });

  return result;
};

const buildMachineTypeLabel = (machineType: MachineTypeWithKey) => {
  if (!machineType?.name) {
    return machineType.key;
  }

  const { name, cpu_count: cpuCount, cpu_description: cpuDescription, credit_per_min: creditPerMin, ram } = machineType;

  return `${name} ${cpuCount} @ ${cpuDescription} ${ram} (${creditPerMin} credits/min)`;
};

const useStackAndMachine = (appSlug = '', selectedStack?: string, isMachineTypeSelectorAvailable = true) => {
  const { isPending: isPendingAllStackInfo, data: allStackInfo } = useQuery({
    enabled: !!appSlug,
    ...getAllStackInfoQueryOptions(appSlug),
  });

  const { isPending: isPendingMachineTypeConfigs, data: machineTypeConfigs } = useQuery({
    enabled: !!(appSlug && isMachineTypeSelectorAvailable),
    ...getMachineTypeConfigsQueryOptions(appSlug),
  });

  const isPending = isMachineTypeSelectorAvailable
    ? isPendingAllStackInfo || isPendingMachineTypeConfigs
    : isPendingAllStackInfo;

  const availableStacks = allStackInfo?.available_stacks ?? {};
  const stackOptions = Object.entries(availableStacks).map(([value, { title }]) => ({ value, title }));
  const stack = selectedStack || stackOptions?.[0]?.value || '';

  const availableMachinesOfStack = allStackInfo?.available_stacks?.[stack]?.available_machines ?? [];
  const availableMachineTypes = availableMachinesOfStack.map((key) => ({
    key,
    ...findMachineTypeByKey(key, machineTypeConfigs),
  }));

  let machineTypeOptions = [{ name: 'Dedicated Machine', value: '', title: 'Dedicated Machine' }];
  if (isMachineTypeSelectorAvailable) {
    machineTypeOptions = availableMachineTypes.map((machineType) => ({
      value: machineType.key,
      name: machineType.name || machineType.key,
      title: buildMachineTypeLabel(machineType),
    }));
  }

  return {
    isPending,
    allStackInfo,
    stackOptions,
    machineTypeConfigs,
    machineTypeOptions,
  };
};

export default useStackAndMachine;
