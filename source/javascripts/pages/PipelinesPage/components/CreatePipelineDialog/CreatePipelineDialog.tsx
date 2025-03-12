import { useEffect } from 'react';
import { DialogProps } from '@bitrise/bitkit';

import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import { trackCreatePipelineDialogShown, trackPipelineCreated } from '@/core/analytics/PipelineAnalytics';
import PipelineService from '@/core/services/PipelineService';
import useBitriseYmlStore, { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';

import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = Omit<DialogProps, 'title'> & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();
  const { displayPipelineConversionNotificationFor } = usePipelineConversionNotification();
  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();

  const baseEntityIds = useBitriseYmlStore(({ yml }) => {
    const pipelineEntries = Object.entries(yml.pipelines ?? {});
    return pipelineEntries.map(([id]) => id);
  });

  useEffect(() => {
    if (props.isOpen) {
      trackCreatePipelineDialogShown(pipelineIds.length ? 'pipeline_selector' : 'pipeline_empty_state');
    }
  }, [pipelineIds.length, props.isOpen]);

  const handleCreatePipeline = (pipelineId: string, basePipelineId?: string) => {
    onCreatePipeline(pipelineId, basePipelineId);

    const { yml } = bitriseYmlStoreApi.getState();
    const basePipeline = PipelineService.getPipeline(basePipelineId ?? '', yml);
    // eslint-disable-next-line no-nested-ternary
    const basePipelineType = PipelineService.getPipelineType(basePipelineId ?? '', yml);
    const numberOfStages = PipelineService.numberOfStages(basePipeline ?? {});

    trackPipelineCreated(pipelineId, basePipelineId, basePipelineType, numberOfStages, 'create_pipeline_popup');

    if (!basePipeline || PipelineService.isGraph(basePipeline)) {
      return;
    }

    if (PipelineService.hasStepInside(pipelineId, 'pull-intermediate-files', yml)) {
      displayPipelineConversionNotificationFor(pipelineId);
    }
  };

  const handleCloseComplete = (pipelineId: string) => {
    if (pipelineId) {
      setSelectedPipeline(pipelineId);
    }
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      entities={[{ ids: baseEntityIds }]}
      entityName="Pipeline"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={handleCreatePipeline}
      sanitizer={PipelineService.sanitizeName}
      validator={(v) => PipelineService.validateName(v, pipelineIds)}
      {...props}
    />
  );
};

export default CreatePipelineDialog;
