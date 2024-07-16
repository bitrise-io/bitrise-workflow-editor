import useStackById from './useStackById';
import useMachineTypeById from './useMachineTypeById';

type Props = {
  appSlug: string;
  stackId: string;
  machineTypeId: string;
  canChangeMachineType: boolean;
};

const useDefaultStackAndMachine = ({ appSlug, stackId, machineTypeId, canChangeMachineType }: Props) => {
  const { isLoading: isDefaultStackLoading, stack: defaultStack } = useStackById({ appSlug, stackId });
  const { isLoading: isDefaultMachineTypeLoading, machineType: defaultMachineType } = useMachineTypeById({
    appSlug,
    stackId,
    machineTypeId,
    canChangeMachineType,
  });

  return {
    isLoading: isDefaultStackLoading || isDefaultMachineTypeLoading,
    defaultStack,
    defaultMachineType,
  };
};

export default useDefaultStackAndMachine;
