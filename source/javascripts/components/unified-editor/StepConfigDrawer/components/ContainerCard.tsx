import { Card, DefinitionTooltip, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

import ContainersMenu from './ContainersMenu';

type ContainerCardProps = {
  type: ContainerType;
};

const ContainerCard = (props: ContainerCardProps) => {
  const { type } = props;

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  return (
    <Card variant="outline" overflow="hidden">
      <Table variant="borderless" disableRowHover>
        <Thead>
          <Tr>
            <Th>
              <Text pl="12">{type === 'execution' ? 'Execution' : 'Service'} Container</Text>
            </Th>
            <Th>
              <DefinitionTooltip label="By default, this step will use an already running container if any. Check “Recreate container” to destroy it and create a clean instance.">
                Behavior
              </DefinitionTooltip>
            </Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <ContainersMenu containers={type === ContainerType.Execution ? executionContainers : serviceContainers} />
            </Td>
            <Td />
            <Td />
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
};

export default ContainerCard;
