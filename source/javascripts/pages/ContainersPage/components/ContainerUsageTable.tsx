import { BitkitControlButton, BitkitTable, IconArrowNortheast } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';

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
    <BitkitTable.Root variant="borderless" tableLayout="fixed" marginBlockStart="24">
      <BitkitTable.Header data-clarity-unmask="true">
        <BitkitTable.Row>
          <BitkitTable.ColumnHeader>Workflow name</BitkitTable.ColumnHeader>
          <BitkitTable.ColumnHeader width="64" />
        </BitkitTable.Row>
      </BitkitTable.Header>
      <BitkitTable.Body>
        {workflows.map((workflowId) => (
          <BitkitTable.Row key={workflowId}>
            <BitkitTable.Cell>
              <Text textStyle="body/md/regular">{workflowId}</Text>
            </BitkitTable.Cell>
            <BitkitTable.Cell textAlign="end">
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
            </BitkitTable.Cell>
          </BitkitTable.Row>
        ))}
      </BitkitTable.Body>
    </BitkitTable.Root>
  );
};

export default ContainerUsageTable;
