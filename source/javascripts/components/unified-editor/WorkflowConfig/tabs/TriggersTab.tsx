import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';
import * as TriggerService from '@/core/services/TriggerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import Triggers from '../../Triggers/Triggers';

const TriggersTab = () => {
  const workflow = useWorkflowConfigContext();

  const { updateWorkflowTriggers } = useBitriseYmlStore((s) => ({
    updateWorkflowTriggers: s.updateWorkflowTriggers,
  }));

  if (!workflow) {
    return null;
  }

  return (
    <Triggers
      id={workflow.id}
      entity="Workflow"
      triggers={workflow.userValues.triggers}
      updateTriggers={updateWorkflowTriggers}
      updateTriggersEnabled={(sourceId, enabled) =>
        TriggerService.updateEnabled(enabled, { source: 'workflows', sourceId })
      }
      additionalTrackingData={{ tab_name: 'workflows', workflow_name: workflow.id }}
    />
  );
};

export default TriggersTab;
