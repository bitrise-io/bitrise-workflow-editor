import { Box, Card, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const DefaultStackAndMachine = () => {
  const meta = useBitriseYmlStore((state) => state.yml.meta);
  const defaultStackId = meta?.['bitrise.io']?.stack || '';
  const defaultMachineTypeId = meta?.['bitrise.io']?.machine_type_id || '';

  return (
    <Box>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <Card>
        <StackAndMachine
          stackId={defaultStackId}
          machineTypeId={defaultMachineTypeId}
          onChange={(s, m) => {
            console.log('Set default stack and machine type', {
              stackId: s,
              machineTypeId: m,
            });
          }}
        />
      </Card>
    </Box>
  );
};

export default DefaultStackAndMachine;
