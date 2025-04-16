import { Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';

const DefaultStackAndMachine = () => {
  const { projectStackId, projectMachineTypeId, projectStackRollbackVersion } = useProjectStackAndMachine();
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
        stackId={projectStackId}
        machineTypeId={projectMachineTypeId}
        onChange={updateDefaultMeta}
        withMachineFallbacks
        stackRollbackVersion={projectStackRollbackVersion}
        withoutDefaultOptions
      />
    </div>
  );
};

export default DefaultStackAndMachine;
