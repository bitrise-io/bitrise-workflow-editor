import { useMemo } from 'react';
import useMachineTypeOptions from './useMachineTypeOptions';

type Props = {
  appSlug: string;
  stackId: string;
  machineTypeId: string;
  canChangeMachineType: boolean;
};

const useMachineTypeById = ({ appSlug, stackId, machineTypeId, canChangeMachineType }: Props) => {
  const { isLoading, machineTypeOptions } = useMachineTypeOptions({
    appSlug,
    stackId,
    canChangeMachineType,
  });
  return useMemo(
    () => ({
      isLoading,
      machineType: machineTypeOptions.find((machineType) => machineType.value === machineTypeId),
    }),
    [isLoading, machineTypeOptions, machineTypeId],
  );
};

export default useMachineTypeById;
