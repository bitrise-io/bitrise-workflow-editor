import { ControlButton, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import { ContainerSource } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const ContainersTable = ({ target }: { target: ContainerSource }) => {
  const yml = useBitriseYmlStore((s) => s.ymlDocument);
  const containers = ContainerService.getAllContainers(yml, target);

  return (
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
          const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(yml, container.id, target);

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
                <ControlButton aria-label="Edit container" iconName="Pencil" color="icon/primary" onClick={() => {}} />
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
  );
};

export default ContainersTable;
