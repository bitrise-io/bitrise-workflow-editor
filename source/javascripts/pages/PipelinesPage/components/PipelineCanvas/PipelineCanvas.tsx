import { Box } from '@bitrise/bitkit';
import { Controls, MiniMap } from '@xyflow/react';

import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import WindowUtils from '@/core/utils/WindowUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import Toolbar from '../Toolbar/Toolbar';
import GraphPipelineCanvas from './GraphPipelineCanvas/GraphPipelineCanvas';
import PipelineConversionNotification from './PipelineConversionNotification';
import PipelineConversionSignposting from './PipelineConversionSignposting';
import StagedPipelineCanvas from './StagedPipelineCanvas/StagedPipelineCanvas';

const PipelineCanvas = () => {
  const { selectedPipeline } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline]?.workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;

  const handleRunPipelineClick = () => {
    const shouldShowTrialUpsellDialog = Boolean(GlobalProps.workspace()?.isRestricted && PageProps.app()?.hasAnyBuild);

    if (shouldShowTrialUpsellDialog) {
      WindowUtils.postMessageToParent('OPEN_TRIAL_UPSELL_DIALOG', {
        reason: 'pipeline_run',
      });
    } else {
      openDialog({
        type: PipelinesPageDialogType.START_BUILD,
        pipelineId: selectedPipeline,
      })();
    }
  };

  return (
    <>
      <PipelineConversionSignposting />
      <PipelineConversionNotification />
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
          onRunClick={handleRunPipelineClick}
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
