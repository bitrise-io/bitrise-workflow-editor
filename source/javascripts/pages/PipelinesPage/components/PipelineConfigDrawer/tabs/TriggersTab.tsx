import Triggers from '@/components/unified-editor/Triggers/Triggers';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  pipelineId: string;
};

const TriggersTab = ({ pipelineId }: Props) => {
  const { triggers, updatePipelineTriggers, updatePipelineTriggersEnabled } = useBitriseYmlStore((s) => ({
    triggers: s.yml.pipelines?.[pipelineId]?.triggers,
    updatePipelineTriggers: s.updatePipelineTriggers,
    updatePipelineTriggersEnabled: s.updatePipelineTriggersEnabled,
  }));

  return (
    <Triggers
      additionalTrackingData={{ tab_name: 'pipelines', pipeline_name: pipelineId }}
      id={pipelineId}
      triggers={triggers}
      updateTriggers={updatePipelineTriggers}
      updateTriggersEnabled={updatePipelineTriggersEnabled}
    />
  );
};

export default TriggersTab;
