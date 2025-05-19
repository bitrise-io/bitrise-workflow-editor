import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';

import TargerBasedTriggersTabContent from '../../Triggers/TargetBasedTriggers/TargetBasedTriggersTabContent';

const TriggersTab = () => {
  const sourceId = useWorkflowConfigContext((s) => s?.id);

  if (!sourceId) {
    return null;
  }

  return <TargerBasedTriggersTabContent source="workflows" sourceId={sourceId} />;
};

export default TriggersTab;
