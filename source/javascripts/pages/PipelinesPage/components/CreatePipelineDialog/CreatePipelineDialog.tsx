import { DialogProps } from '@bitrise/bitkit';
import PipelineService from '@/core/models/PipelineService';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = Omit<DialogProps, 'title'> & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const isPipelineConversionEnabled = useFeatureFlag('enable-create-graph-pipeline-based-on-staged-pipeline');

  const baseEntityIds = useBitriseYmlStore(({ yml }) => {
    const pipelineEntries = Object.entries(yml.pipelines ?? {});

    if (isPipelineConversionEnabled) {
      return pipelineEntries.map(([id]) => id);
    }

    const graphPipelineEntries = pipelineEntries.filter(([, pipeline]) => PipelineService.isGraph(pipeline));
    return graphPipelineEntries.map(([id]) => id);
  });

  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();

  const handleCloseComplete = (pipelineId: string) => {
    if (pipelineId) {
      setSelectedPipeline(pipelineId);
    }
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      baseEntityIds={baseEntityIds}
      entityName="Pipeline"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={onCreatePipeline}
      sanitizer={PipelineService.sanitizeName}
      validator={(v) => PipelineService.validateName(v, pipelineIds)}
      {...props}
    />
  );
};

export default CreatePipelineDialog;
