import { Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';

const DefaultStackAndMachine = () => {
  const { projectStackId, projectMachineTypeId, projectStackRollbackVersion } = useProjectStackAndMachine();

  const updateDefaultMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    StackAndMachineService.updateStackAndMachine(
      { stackId: stack, machineTypeId: machine_type_id, stackRollbackVersion: stack_rollback_version },
      StackAndMachineSource.Root,
    );
  };

  return (
    <div>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <StackAndMachine
        stackId={projectStackId}
        machineTypeId={projectMachineTypeId}
        withMachineFallbacks
        stackRollbackVersion={projectStackRollbackVersion}
        withoutDefaultOptions
        onChange={updateDefaultMeta}
      />
    </div>
  );
};

export default DefaultStackAndMachine;
