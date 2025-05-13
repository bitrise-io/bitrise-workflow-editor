import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';

import TargerBasedTriggersTabContent from '../../Triggers/TargetBasedTriggers/TargetBasedTriggersTabContent';

const TriggersTab = () => {
  const workflow = useWorkflowConfigContext();

  if (!workflow) {
    return null;
  }

  return <TargerBasedTriggersTabContent source="workflows" sourceId={workflow.id} />;
};

export default TriggersTab;
