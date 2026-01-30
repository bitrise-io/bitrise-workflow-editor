import { ControlButton, Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';

import useNavigation from '@/hooks/useNavigation';

type Props = {
  workflows: string[];
};

const WorkflowsUsedByContainerTable = ({ workflows }: Props) => {
  const { replace } = useNavigation();

  return (
    <Table isFixed variant="borderless" mt="24">
      <Thead>
        <Tr>
          <Th textStyle="heading/h5">Workflow name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {workflows.map((workflowId) => (
          <Tr key={workflowId}>
            <Td>
              <Text textStyle="body/md/regular">{workflowId}</Text>
            </Td>
            <Td width="60px" textAlign="right">
              <ControlButton
                aria-label="Go to Workflow"
                iconName="ArrowNorthEast"
                onClick={() => replace('/workflows', { workflow_id: workflowId })}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default WorkflowsUsedByContainerTable;
