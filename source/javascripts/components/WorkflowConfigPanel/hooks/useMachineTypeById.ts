import { useMemo } from 'react';
import useMachineTypeOptions from './useMachineTypeOptions';

type Props = {
  appSlug: string;
  stackId: string;
  machineTypeId: string;
  canChangeMachineType: boolean;
};

const useMachineTypeById = ({ appSlug, stackId, machineTypeId, canChangeMachineType }: Props) => {
  const { isPending, machineTypeOptions } = useMachineTypeOptions({
    appSlug,
    stackId,
    canChangeMachineType,
  });
  return useMemo(
    () => ({
      isPending,
      machineType: machineTypeOptions.find((machineType) => machineType.value === machineTypeId),
    }),
    [isPending, machineTypeOptions, machineTypeId],
  );
};

export default useMachineTypeById;
