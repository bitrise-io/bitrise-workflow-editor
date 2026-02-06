import { Button, Card, Table, Tbody, Td, Th, Thead, Tr } from '@bitrise/bitkit';

const ContainerCard = () => {
  return (
    <Card variant="outline" overflow="hidden">
      <Table variant="borderless" disableRowHover>
        <Thead>
          <Tr>
            <Th>Execution Container</Th>
            <Th>Behavior</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Button variant="tertiary" leftIconName="Plus" size="sm">
                Add container
              </Button>
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
