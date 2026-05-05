import { Text } from '@bitrise/bitkit';

import WorkflowStackAndMachine from '@/components/StacksAndMachine/WorkflowStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import ToolVersions from '@/components/ToolVersions/ToolVersions';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useFeatureFlag from '@/hooks/useFeatureFlag';

const WorkflowsTab = () => {
  const isToolVersionsEnabled = useFeatureFlag('enable-wfe-tool-versions');
  const workflowIds = useBitriseYmlStore((state) =>
    Object.keys(state.yml.workflows ?? {}).filter((workflowId) => !WorkflowService.isUtilityWorkflow(workflowId)),
  );

  return (
    <TabContainer>
      {workflowIds.map((workflowId) => (
        <div key={workflowId}>
          <Text as="h4" textStyle="heading/h4" mb="12">
            {workflowId}
          </Text>
          <WorkflowStackAndMachine workflowId={workflowId} />
          {isToolVersionsEnabled && <ToolVersions workflowId={workflowId} />}
        </div>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
