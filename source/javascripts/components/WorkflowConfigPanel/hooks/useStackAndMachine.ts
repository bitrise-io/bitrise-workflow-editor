import useStackOptions from './useStackOptions';
import useMachineTypeOptions from './useMachineTypeOptions';
import useStackById from './useStackById';
import useMachineTypeById from './useMachineTypeById';
import useDefaultStackAndMachine from './useDefaultStackAndMachine';

type Props = {
  appSlug: string;
  selectedStackId: string;
  selectedMachineTypeId: string;
  defaultStackId: string;
  defaultMachineTypeId: string;
  canChangeMachineType: boolean;
};

const useStackAndMachine = ({
  appSlug = '',
  canChangeMachineType = true,
  selectedStackId,
  selectedMachineTypeId,
  defaultStackId,
  defaultMachineTypeId,
}: Props) => {
  const stackId = selectedStackId || defaultStackId;
  const machineTypeId = selectedMachineTypeId || defaultMachineTypeId;

  const { isPending: isStackOptionsPending, stackOptions } = useStackOptions({
    appSlug,
  });
  const { isPending: isMachineTypeOptionsPending, machineTypeOptions } = useMachineTypeOptions({
    appSlug,
    stackId,
    canChangeMachineType,
  });
  const {
    isPending: isDefaultsPending,
    defaultStack,
    defaultMachineType,
  } = useDefaultStackAndMachine({
    appSlug,
    stackId: defaultStackId,
    machineTypeId: defaultMachineTypeId,
    canChangeMachineType,
  });

  const { isPending: isStackPending, stack = defaultStack } = useStackById({
    appSlug,
    stackId,
  });

  const { isPending: isMachineTypePending, machineType } = useMachineTypeById({
    appSlug,
    stackId,
    machineTypeId,
    canChangeMachineType,
  });

  const isPending =
    isStackOptionsPending || isMachineTypeOptionsPending || isDefaultsPending || isStackPending || isMachineTypePending;

  return {
    isPending,
    stack,
    defaultStack,
    stackOptions,
    machineType,
    defaultMachineType,
    machineTypeOptions,
  };
};

export default useStackAndMachine;
