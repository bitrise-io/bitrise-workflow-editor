import { Box } from '@chakra-ui/react/box';
import { useToken } from '@chakra-ui/react/styled-system';
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

// React Flow's Controls and MiniMap take their colours from its --xy-* variables, which default to fixed greys.
// Pointed at Bitkit's semantic tokens they follow the colour mode with the rest of the canvas. Its own dark
// mode (colorMode="dark") would instead paint the canvas #141414 over background/secondary.
const XY_COLOR_TOKENS = [
  'background/primary',
  'background/hover',
  'background/active',
  'background/tertiary',
  'border/minimal',
  'icon/secondary',
  'icon/primary',
];

const useXyColorVariables = () => {
  const [surface, hover, active, mask, border, icon, iconHover] = useToken('colors', XY_COLOR_TOKENS);
  return {
    '--xy-controls-button-background-color': surface,
    '--xy-controls-button-background-color-hover': hover,
    '--xy-controls-button-border-color': border,
    '--xy-controls-button-color': icon,
    '--xy-controls-button-color-hover': iconHover,
    '--xy-minimap-background-color': surface,
    '--xy-minimap-mask-background-color': `color-mix(in srgb, ${mask} 60%, transparent)`,
    '--xy-minimap-node-background-color': active,
  };
};

const PipelineCanvas = () => {
  const { selectedPipeline } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const variant = useBitriseYmlStore(({ yml }) => (yml.pipelines?.[selectedPipeline]?.workflows ? 'graph' : 'staged'));
  const CanvasComponent = variant === 'graph' ? GraphPipelineCanvas : StagedPipelineCanvas;
  const xyColorVariables = useXyColorVariables();

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
      <Box background="background/secondary" flex="1" position="relative" userSelect="none" css={xyColorVariables}>
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
