import { Box, Card, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useDefaultStackAndMachine from '@/hooks/useDefaultStackAndMachine';

const DefaultStackAndMachine = () => {
  const { stackId, machineTypeId } = useDefaultStackAndMachine();

  // TODO implement writing the changes to the YML
  const updateDefaultMeta = (stack?: string, machine_type_id?: string) =>
    console.log('Set default stack and machine type', {
      stack,
      machine_type_id,
    });

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
