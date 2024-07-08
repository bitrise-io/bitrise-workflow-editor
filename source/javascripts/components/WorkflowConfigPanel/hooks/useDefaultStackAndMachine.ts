import useStackById from './useStackById';
import useMachineTypeById from './useMachineTypeById';

type Props = {
  appSlug: string;
  stackId: string;
  machineTypeId: string;
  canChangeMachineType: boolean;
};

const useDefaultStackAndMachine = ({ appSlug, stackId, machineTypeId, canChangeMachineType }: Props) => {
  const { isPending: isDefaultStackPending, stack: defaultStack } = useStackById({ appSlug, stackId });
  const { isPending: isDefaultMachineTypePending, machineType: defaultMachineType } = useMachineTypeById({
    appSlug,
    stackId,
    machineTypeId,
    canChangeMachineType,
  });

  return {
    isPending: isDefaultStackPending || isDefaultMachineTypePending,
    defaultStack,
    defaultMachineType,
  };
};

export default useDefaultStackAndMachine;
