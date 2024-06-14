import { useQueries } from '@tanstack/react-query';
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

const useStackAndMachine = (appSlug?: string, selectedStack?: string) => {
  const {
    isPending,
    data: { allStackInfo, machineTypeConfigs },
  } = useQueries({
    queries: [
      { enabled: !!appSlug, ...getAllStackInfoQueryOptions(appSlug || '') },
      { enabled: !!appSlug, ...getMachineTypeConfigsQueryOptions(appSlug || '') },
    ],
    combine: (results) => ({
      isPending: results.some((result) => result.isPending),
      data: { allStackInfo: results[0].data, machineTypeConfigs: results[1].data },
    }),
  });

  const stackOptions = Object.entries(allStackInfo?.available_stacks ?? {}).map(([value, { title }]) => {
    return { value, title };
  });

  const stack = selectedStack || stackOptions?.[0]?.value || '';
  const availableMachineTypes = (allStackInfo?.available_stacks?.[stack]?.available_machines ?? [])
    .map((key) => ({ key, ...findMachineTypeByKey(key, machineTypeConfigs) }))
    .sort((a, b) => (a?.credit_per_min ?? 0) - (b?.credit_per_min ?? 0));

  const machineTypeOptions = availableMachineTypes.map((machineType) => {
    return {
      name: machineType.name,
      value: machineType.key,
      title: buildMachineTypeLabel(machineType),
    };
  });

  return {
    isPending,
    allStackInfo,
    stackOptions,
    machineTypeConfigs,
    machineTypeOptions,
  };
};

export default useStackAndMachine;
