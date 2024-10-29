import { Box } from '@bitrise/bitkit';
import { Controls, MiniMap } from 'reactflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import StagedPipelineCanvas from './StagedPipelineCanvas/StagedPipelineCanvas';
import GraphPipelineCanvas from './GraphPipelineCanvas/GraphPipelineCanvas';

const PipelineCanvas = () => {
  const { selectedPipeline } = usePipelineSelector();
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline].workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;

  return (
    <Box bg="background/secondary" flex="1">
      <CanvasComponent proOptions={{ hideAttribution: true }}>
        <Controls />
        <MiniMap />
      </CanvasComponent>
    </Box>
  );
};

export default PipelineCanvas;
