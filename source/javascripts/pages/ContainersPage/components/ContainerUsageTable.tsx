import { Table, Tbody, Td, Text, Th, Thead, Tr } from '@bitrise/bitkit';
import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';

import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import useNavigation from '@/hooks/useNavigation';
import { useIsMergedConfigSelected, useSelectedNodeId, useTree } from '@/hooks/useTree';

type Props = {
  workflows: string[];
};

const ContainerUsageTable = ({ workflows }: Props) => {
  const { replace } = useNavigation();
  // Modular: jump to the workflow where the container is *used*. Usage is computed from the active
  // module file, so the reference lives there — jump to that file rather than the workflow's top-most
  // definition (which may be a different file). Non-modular: plain navigation to the Workflows page.
  const isModular = Boolean(useTree());
  const selectedNodeId = useSelectedNodeId();
  const isMergedConfig = useIsMergedConfigSelected();
  // On the merged (read-only) view the active node isn't a real file, so fall back to the definition
  // jump; on a concrete module file, target that file where the usage is.
  const usageNodeIds = !isMergedConfig && selectedNodeId ? [selectedNodeId] : undefined;

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
                <CrossFileJumpButton kind="workflows" id={workflowId} nodeIds={usageNodeIds} label="Go to Workflow" />
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
