import { Box } from '@bitrise/bitkit';
import { Controls, MiniMap } from '@xyflow/react';
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
    <Box bg="background/secondary" flex="1" position="relative">
      <Toolbar
        top="16"
        left="50%"
        zIndex="10"
        position="absolute"
        transform="translateX(-50%)"
        width="clamp(0px, calc(100% - 32px), 768px)"
        onWorkflowsClick={openDialog(PipelineConfigDialogType.WORKFLOW_SELECTOR, selectedPipeline)}
        onPropertiesClick={openDialog(PipelineConfigDialogType.PIPELINE_CONFIG, selectedPipeline)}
        onCreatePipelineClick={openDialog(PipelineConfigDialogType.CREATE_PIPELINE)}
      />
      <CanvasComponent key={selectedPipeline} proOptions={{ hideAttribution: true }}>
        <Controls />
        <MiniMap />
      </CanvasComponent>
    </Box>
  );
};

export default PipelineCanvas;
