import { useMemo } from 'react';
import { MachineTypeConfigs } from '../services/getMachineTypeConfigs';
import useStacks from './useStacks';
import useMachineTypes from './useMachineTypes';

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
type Props = {
  appSlug: string;
  stackId: string;
  canChangeMachineType: boolean;
};

const useMachineTypeOptions = ({ appSlug, canChangeMachineType, stackId }: Props) => {
  const { isLoading: isStackLoading, data: allStackInfo } = useStacks({
    appSlug,
  });
  const { isLoading: isMachineTypeLoading, data: machineTypeConfigs } = useMachineTypes({
    appSlug,
    canChangeMachineType,
  });

  const isLoading = isStackLoading || isMachineTypeLoading;

  const machineTypeOptions = useMemo(() => {
    const availableMachinesOfStack = allStackInfo?.available_stacks?.[stackId]?.available_machines ?? [];
    const availableMachineTypes = availableMachinesOfStack.map((key) => ({
      key,
      ...findMachineTypeByKey(key, machineTypeConfigs),
    }));

    return availableMachineTypes.map((machineType) => ({
      value: machineType.key,
      name: machineType.name || machineType.key,
      title: buildMachineTypeLabel(machineType),
    }));
  }, [allStackInfo?.available_stacks, machineTypeConfigs, stackId]);

  return {
    isLoading,
    machineTypeOptions,
  };
};

export default useMachineTypeOptions;
