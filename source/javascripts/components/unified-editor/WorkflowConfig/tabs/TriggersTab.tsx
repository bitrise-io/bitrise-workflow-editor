import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import Triggers from '@/components/unified-editor/Triggers/Triggers';

const TriggersTab = () => {
  const workflow = useWorkflowConfigContext();

  const { updateWorkflowTriggers, updateWorkflowTriggersEnabled, yml } = useBitriseYmlStore((s) => ({
    updateWorkflowTriggers: s.updateWorkflowTriggers,
    updateWorkflowTriggersEnabled: s.updateWorkflowTriggersEnabled,
    yml: s.yml,
  }));

  if (!workflow) {
    return null;
  }

  return (
    <Triggers
      additionalTrackingData={{ tab_name: 'workflows', workflow_name: workflow.id }}
      id={workflow.id}
      triggers={workflow.userValues.triggers}
      updateTriggers={updateWorkflowTriggers}
      updateTriggersEnabled={updateWorkflowTriggersEnabled}
      yml={yml}
    />
  );
};

export default TriggersTab;
