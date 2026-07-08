import { Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';
import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';

import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import { useContainerUsageByWorkflow } from '@/hooks/useContainerWorkflowUsage';
import useNavigation from '@/hooks/useNavigation';
import { useTree } from '@/hooks/useTree';

type Props = {
  containerId: string;
  workflows: string[];
};

const ContainerUsageTable = ({ containerId, workflows }: Props) => {
  const { replace } = useNavigation();
  // Modular: usage can span modules, so jump to the using workflow's definition — but only to the
  // modules where that workflow actually references this container, not every module that happens to
  // define a same-named workflow. Non-modular: plain navigation to the Workflows page.
  const isModular = Boolean(useTree());
  const usageByWorkflow = useContainerUsageByWorkflow(containerId);

  return (
    <Table isFixed variant="borderless" mt="24">
      <Thead>
        <Tr>
          <Th textStyle="heading/h5">Workflow name</Th>
          <Th width="60px" textAlign="right" />
        </Tr>
      </Thead>
      <Tbody>
        {workflows.map((workflowId) => (
          <Tr key={workflowId}>
            <Td>
              <Text textStyle="body/md/regular">{workflowId}</Text>
            </Td>
            <Td>
              {isModular ? (
                <CrossFileJumpButton
                  kind="workflows"
                  id={workflowId}
                  nodeIds={usageByWorkflow.get(workflowId)}
                  label="Go to Workflow"
                />
              ) : (
                <BitkitControlButton
                  size="xs"
                  icon={IconArrowNortheast}
                  label="Go to Workflow"
                  onClick={() => replace('/workflows', { workflow_id: workflowId })}
                />
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ContainerUsageTable;
