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

  const { isLoading: isStackOptionsLoading, stackOptions } = useStackOptions({
    appSlug,
  });
  const { isLoading: isMachineTypeOptionsLoading, machineTypeOptions } = useMachineTypeOptions({
    appSlug,
    stackId,
    canChangeMachineType,
  });
  const {
    isLoading: isDefaultsLoading,
    defaultStack,
    defaultMachineType,
  } = useDefaultStackAndMachine({
    appSlug,
    stackId: defaultStackId,
    machineTypeId: defaultMachineTypeId,
    canChangeMachineType,
  });

  const { isLoading: isStackLoading, stack = defaultStack } = useStackById({
    appSlug,
    stackId,
  });

  const { isLoading: isMachineTypeLoading, machineType } = useMachineTypeById({
    appSlug,
    stackId,
    machineTypeId,
    canChangeMachineType,
  });

  const isLoading =
    isStackLoading || isStackOptionsLoading || isMachineTypeLoading || isMachineTypeOptionsLoading || isDefaultsLoading;

  return {
    isLoading,
    stack,
    defaultStack,
    stackOptions,
    machineType,
    defaultMachineType,
    machineTypeOptions,
  };
};

export default useStackAndMachine;
