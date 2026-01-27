import { Box, Button, ControlButton, EmptyState, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import { ContainerSource } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const ExecutionContainersTab = () => {
  const yml = useBitriseYmlStore((s) => s.ymlDocument);
  const containers = ContainerService.getAllContainers(yml, ContainerSource.Execution);

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={() => {}}>
          Add container
        </Button>
      </Box>
      <EmptyState
        title="Your execution containers will appear here"
        description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
        iconName="Container"
      />
      <Table isFixed>
        <Thead>
          <Tr>
            <Th textStyle="heading/h5" width="160px">
              Unique ID
            </Th>
            <Th textStyle="heading/h5">Image</Th>
            <Th textStyle="heading/h5">Used in</Th>
            <Th width="120px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {containers.map((container) => {
            const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(
              yml,
              container.id,
              ContainerSource.Execution,
            );

            return (
              <Tr key={container.id}>
                <Td>
                  <Text textStyle="body/md/regular">{container.id}</Text>
                </Td>
                <Td>
                  <Text textStyle="body/md/regular">{container.userValues.image}</Text>
                </Td>
                <Td>
                  <Text textStyle="body/md/regular">{workflowsUsedByContainer.length} Workflows</Text>
                </Td>
                <Td>
                  <ControlButton
                    aria-label="Edit container"
                    iconName="Pencil"
                    color="icon/primary"
                    onClick={() => {}}
                  />
                  <ControlButton
                    aria-label="Delete container"
                    iconName="MinusCircle"
                    color="icon/negative"
                    onClick={() => {}}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ExecutionContainersTab;
