import { Box } from '@bitrise/bitkit';
import { Controls, MiniMap } from 'reactflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import Toolbar from '../Toolbar/Toolbar';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import StagedPipelineCanvas from './StagedPipelineCanvas/StagedPipelineCanvas';
import GraphPipelineCanvas from './GraphPipelineCanvas/GraphPipelineCanvas';

const PipelineCanvas = () => {
  const { openDialog } = usePipelinesPageStore();
  const { selectedPipeline } = usePipelineSelector();
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline].workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;

  return (
    <Box bg="background/secondary" flex="1">
      <CanvasComponent proOptions={{ hideAttribution: true }}>
        <Box position="relative" zIndex="50" p="16" mx="auto" w={['auto', 900]}>
          <Toolbar onPropertiesClick={openDialog(PipelineConfigDialogType.PIPELINE_CONFIG, selectedPipeline)} />
        </Box>
        <Controls />
        <MiniMap />
      </CanvasComponent>
    </Box>
  );
};

export default PipelineCanvas;
