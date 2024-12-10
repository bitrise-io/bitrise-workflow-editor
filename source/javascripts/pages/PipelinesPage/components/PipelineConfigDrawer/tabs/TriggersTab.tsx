import TriggersContent from '@/components/unified-editor/TriggersContent/TriggersContent';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  pipelineId: string;
};

const TriggersTab = ({ pipelineId }: Props) => {
  const { updatePipelineTriggers, updatePipelineTriggersEnabled, yml } = useBitriseYmlStore((s) => ({
    updatePipelineTriggers: s.updatePipelineTriggers,
    updatePipelineTriggersEnabled: s.updatePipelineTriggersEnabled,
    yml: s.yml,
  }));

  return (
    <TriggersContent
      additionalTrackingData={{ tab_name: 'pipelines', pipeline_name: pipelineId }}
      id={pipelineId}
      triggers={yml.pipelines?.[pipelineId].triggers}
      updateTriggers={updatePipelineTriggers}
      updateTriggersEnabled={updatePipelineTriggersEnabled}
      yml={yml}
    />
  );
};

export default TriggersTab;
