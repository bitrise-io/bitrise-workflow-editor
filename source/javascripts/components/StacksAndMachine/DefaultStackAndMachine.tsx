import { Card, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useDefaultStackAndMachine from '@/hooks/useDefaultStackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const DefaultStackAndMachine = () => {
  const { stackId, machineTypeId } = useDefaultStackAndMachine();
  const updateStacksAndMachinesMeta = useBitriseYmlStore((s) => s.updateStacksAndMachinesMeta);

  const updateDefaultMeta = (stack?: string, machine_type_id?: string) => {
    updateStacksAndMachinesMeta({
      stack,
      machine_type_id,
    });
  };

  return (
    <div>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <StackAndMachine as={Card} stackId={stackId} machineTypeId={machineTypeId} onChange={updateDefaultMeta} />
    </div>
  );
};

export default DefaultStackAndMachine;
