import { Box, Ribbon } from '@bitrise/bitkit';
import { Controls, MiniMap } from '@xyflow/react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import Toolbar from '../Toolbar/Toolbar';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';
import StagedPipelineCanvas from './StagedPipelineCanvas/StagedPipelineCanvas';
import GraphPipelineCanvas from './GraphPipelineCanvas/GraphPipelineCanvas';

const PipelineCanvas = () => {
  const { isPipelineConversionNotificationDisplayedFor, hidePipelineConversionNotificationFor } =
    usePipelineConversionNotification();

  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const { selectedPipeline } = usePipelineSelector();
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline].workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;

  return (
    <>
      {isPipelineConversionNotificationDisplayedFor(selectedPipeline) && (
        <Ribbon colorScheme="blue" onClose={() => hidePipelineConversionNotificationFor(selectedPipeline)}>
          This Pipeline is based on a staged setup. Review artifact sharing and running conditions before running.
        </Ribbon>
      )}
      <Box bg="background/secondary" flex="1" position="relative" userSelect="none">
        <Toolbar
          top="16"
          left="50%"
          zIndex="10"
          position="absolute"
          transform="translateX(-50%)"
          width="clamp(0px, calc(100% - 32px), 768px)"
          onWorkflowsClick={openDialog({
            type: PipelinesPageDialogType.WORKFLOW_SELECTOR,
            pipelineId: selectedPipeline,
          })}
          onPropertiesClick={openDialog({
            type: PipelinesPageDialogType.PIPELINE_CONFIG,
            pipelineId: selectedPipeline,
          })}
          onCreatePipelineClick={openDialog({
            type: PipelinesPageDialogType.CREATE_PIPELINE,
          })}
          onRunClick={openDialog({
            type: PipelinesPageDialogType.START_BUILD,
            pipelineId: selectedPipeline,
          })}
        />
        <CanvasComponent key={selectedPipeline} proOptions={{ hideAttribution: true }}>
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable zoomStep={1} />
        </CanvasComponent>
      </Box>
    </>
  );
};

export default PipelineCanvas;
