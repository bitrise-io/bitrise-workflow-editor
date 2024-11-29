import { DialogProps } from '@bitrise/bitkit';
import PipelineService from '@/core/models/PipelineService';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = Omit<DialogProps, 'title'> & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();

  const handleCloseComplete = (pipelineId: string) => {
    if (pipelineId) {
      setSelectedPipeline(pipelineId);
    }
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      baseEntityIds={pipelineIds}
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
