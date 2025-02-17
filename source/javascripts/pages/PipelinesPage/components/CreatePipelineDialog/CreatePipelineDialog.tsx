import { DialogProps } from '@bitrise/bitkit';
import PipelineService from '@/core/services/PipelineService';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import useBitriseYmlStore, { useBitriseYmlStoreApi } from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import usePipelineConversionNotification from '../../hooks/usePipelineConversionNotification';

type Props = Omit<DialogProps, 'title'> & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const bitriseYmlStoreApi = useBitriseYmlStoreApi();
  const { displayPipelineConversionNotificationFor } = usePipelineConversionNotification();

  const baseEntityIds = useBitriseYmlStore(({ yml }) => {
    const pipelineEntries = Object.entries(yml.pipelines ?? {});
    return pipelineEntries.map(([id]) => id);
  });

  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();

  const handleCloseComplete = (pipelineId: string) => {
    if (pipelineId) {
      setSelectedPipeline(pipelineId);
    }
    onCloseComplete?.();
  };

  const handleCreatePipeline = (pipelineId: string, basePipelineId?: string) => {
    onCreatePipeline(pipelineId, basePipelineId);

    const { yml } = bitriseYmlStoreApi.getState();
    const basePipeline = PipelineService.getPipeline(basePipelineId ?? '', yml);

    if (!basePipeline || PipelineService.isGraph(basePipeline)) {
      return;
    }

    if (PipelineService.hasStepInside(pipelineId, 'pull-intermediate-files', yml)) {
      displayPipelineConversionNotificationFor(pipelineId);
    }
  };

  return (
    <CreateEntityDialog
      baseEntityIds={baseEntityIds}
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
