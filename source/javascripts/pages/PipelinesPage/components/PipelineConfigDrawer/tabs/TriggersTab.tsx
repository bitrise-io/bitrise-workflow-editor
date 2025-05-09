import Triggers from '@/components/unified-editor/Triggers/Triggers';
import TriggerService from '@/core/services/TriggerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  pipelineId: string;
};

const TriggersTab = ({ pipelineId }: Props) => {
  const { triggers, updatePipelineTriggers } = useBitriseYmlStore((s) => ({
    triggers: s.yml.pipelines?.[pipelineId]?.triggers,
    updatePipelineTriggers: s.updatePipelineTriggers,
  }));

  return (
    <Triggers
      source="pipelines"
      sourceId={pipelineId}
      triggers={triggers}
      updateTriggers={updatePipelineTriggers}
      updateTriggersEnabled={(sourceId, enabled) =>
        TriggerService.updateEnabled(enabled, { source: 'pipelines', sourceId })
      }
      additionalTrackingData={{ tab_name: 'pipelines', pipeline_name: pipelineId }}
    />
  );
};

export default TriggersTab;
