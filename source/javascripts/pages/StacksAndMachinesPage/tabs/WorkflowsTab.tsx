import { Icon, Label } from '@bitrise/bitkit';

import WorkflowStackAndMachine from '@/components/StacksAndMachine/WorkflowStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const WorkflowsTab = () => {
  const workflowIds = useBitriseYmlStore((state) =>
    Object.keys(state.yml.workflows ?? {}).filter((workflowId) => !WorkflowService.isUtilityWorkflow(workflowId)),
  );

  return (
    <TabContainer>
      {workflowIds.map((workflowId) => (
        <div key={workflowId}>
          <Label mb="12">
            <Icon name="Workflow" size="16" />
            {workflowId}
          </Label>
          <WorkflowStackAndMachine workflowId={workflowId} />
        </div>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
