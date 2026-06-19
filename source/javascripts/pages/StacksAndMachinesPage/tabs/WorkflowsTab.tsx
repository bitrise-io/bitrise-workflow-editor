import { Box, Text } from '@bitrise/bitkit';

import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import WorkflowStackAndMachine from '@/components/StacksAndMachine/WorkflowStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useDefiningFilePath, useIsMergedConfigSelected } from '@/hooks/useTree';

type GroupProps = {
  workflowId: string;
  /** Merged (read-only) view: show "Defined in {file}" + a jump-to-definition arrow. */
  showDefinition: boolean;
};

const WorkflowStackGroup = ({ workflowId, showDefinition }: GroupProps) => {
  const definingPath = useDefiningFilePath('workflows', workflowId);

  return (
    <Box>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="8" mb="12">
        <Box>
          <Text as="h4" textStyle="heading/h4">
            {workflowId}
          </Text>
          {showDefinition && definingPath && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              Defined in {definingPath}
            </Text>
          )}
        </Box>
        {showDefinition && <CrossFileJumpButton kind="workflows" id={workflowId} />}
      </Box>
      <WorkflowStackAndMachine workflowId={workflowId} />
    </Box>
  );
};

const WorkflowsTab = () => {
  // `yml` reflects the active document, so on a single module-file tab this is already scoped to
  // that file's workflows; on the merged tab it's every workflow.
  const workflowIds = useBitriseYmlStore((state) =>
    Object.keys(state.yml.workflows ?? {}).filter((workflowId) => !WorkflowService.isUtilityWorkflow(workflowId)),
  );
  const isMergedView = useIsMergedConfigSelected();

  return (
    <TabContainer>
      {workflowIds.map((workflowId) => (
        <WorkflowStackGroup key={workflowId} workflowId={workflowId} showDefinition={isMergedView} />
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
