import TargerBasedTriggersTabContent from '@/components/unified-editor/Triggers/TargetBasedTriggers/TargetBasedTriggersTabContent';

type Props = {
  pipelineId: string;
};

const TriggersTab = ({ pipelineId }: Props) => {
  return <TargerBasedTriggersTabContent source="pipelines" sourceId={pipelineId} />;
};

export default TriggersTab;
