import { Card, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useDefaultStackAndMachine from '@/hooks/useDefaultStackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const DefaultStackAndMachine = () => {
  const { stackId, machineTypeId, stackRollbackVersion } = useDefaultStackAndMachine();
  const updateStacksAndMachinesMeta = useBitriseYmlStore((s) => s.updateStacksAndMachinesMeta);

  const updateDefaultMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    updateStacksAndMachinesMeta({
      stack,
      machine_type_id,
      stack_rollback_version,
    });
  };

  return (
    <div>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <StackAndMachine
        as={Card}
        stackId={stackId}
        machineTypeId={machineTypeId}
        onChange={updateDefaultMeta}
        useRollbackVersion={!!stackRollbackVersion}
        withoutDefaultStack
      />
    </div>
  );
};

export default DefaultStackAndMachine;
