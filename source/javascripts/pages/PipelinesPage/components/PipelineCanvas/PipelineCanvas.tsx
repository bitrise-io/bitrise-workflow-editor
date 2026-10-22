import { Box } from '@chakra-ui/react/box';
import { Background, BackgroundVariant, Controls, MiniMap } from '@xyflow/react';

import {
  CANVAS_DOT_COLOR,
  CANVAS_DOT_GAP,
  CANVAS_DOT_SIZE,
  CANVAS_EDGE_SHADOW,
} from '@/components/unified-editor/canvasDots';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import Toolbar, { floatingControlsProps, PipelineActionsProvider } from '../Toolbar/Toolbar';
import GraphPipelineCanvas from './GraphPipelineCanvas/GraphPipelineCanvas';
import PipelineConversionNotification from './PipelineConversionNotification';
import PipelineConversionSignposting from './PipelineConversionSignposting';
import StagedPipelineCanvas from './StagedPipelineCanvas/StagedPipelineCanvas';

const PipelineCanvas = () => {
  const { selectedPipeline } = usePipelineSelector();
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline]?.workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;

  return (
    <PipelineActionsProvider>
      <PipelineConversionSignposting />
      <PipelineConversionNotification />
      <Box flex="1" minHeight="0" display="flex" flexDirection="column">
        <Box
          background="background/secondary"
          flex="1"
          minHeight="0"
          position="relative"
          userSelect="none"
          // The shared canvas dot grid; React Flow's own pattern, so it pans and zooms with the Pipeline.
          css={{ '& .react-flow__background-pattern.dots': { fill: CANVAS_DOT_COLOR } }}
          // The shared canvas edge shadow, on a layer over React Flow that clicks pass through.
          _after={{
            content: '""',
            position: 'absolute',
            inset: '0',
            zIndex: '5',
            pointerEvents: 'none',
            boxShadow: CANVAS_EDGE_SHADOW,
          }}
        >
          {/* The Pipeline's name, menu and Run float over the canvas's top-left; the graph starts below them. */}
          <Box {...floatingControlsProps} position="absolute" top="16" left="16" zIndex="10">
            <Toolbar />
          </Box>
          <CanvasComponent key={selectedPipeline} proOptions={{ hideAttribution: true }}>
            <Background variant={BackgroundVariant.Dots} gap={CANVAS_DOT_GAP} size={CANVAS_DOT_SIZE} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable zoomStep={1} />
          </CanvasComponent>
        </Box>
      </Box>
    </PipelineActionsProvider>
  );
};

export default PipelineCanvas;
