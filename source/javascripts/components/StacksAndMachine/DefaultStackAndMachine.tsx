import { Box, Card, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useDefaultStackAndMachine from '@/hooks/useDefaultStackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const DefaultStackAndMachine = () => {
  const { stackId, machineTypeId } = useDefaultStackAndMachine();
  const updateStacksAndMachinesMeta = useBitriseYmlStore((s) => s.updateStacksAndMachinesMeta);

  // TODO implement writing the changes to the YML
  const updateDefaultMeta = (stack?: string, machine_type_id?: string) => {
    console.log({ machine_type_id, stack });
    updateStacksAndMachinesMeta({
      stack,
      machine_type_id,
    });
  };

  return (
    <Box>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <Card>
        <StackAndMachine stackId={stackId} machineTypeId={machineTypeId} onChange={updateDefaultMeta} />
      </Card>
    </Box>
  );
};

export default DefaultStackAndMachine;
