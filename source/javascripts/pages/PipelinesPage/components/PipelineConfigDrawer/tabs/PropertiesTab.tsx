import { useCallback } from 'react';
import { Box, Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import PipelineService from '@/core/models/PipelineService';
import EditableInput from '@/components/EditableInput/EditableInput';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import useRenamePipeline from '@/pages/PipelinesPage/hooks/useRenamePipeline';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import DeletePipelineDialog from '../components/DeletePipelineDialog/DeletePipelineDialog';

type Props = {
  onDelete: () => void;
  pipelineId: string;
};

const PropertiesTab = ({ onDelete, pipelineId }: Props) => {
  const setPipelineId = usePipelinesPageStore((s) => s.setPipelineId);
  const { keys, onSelectPipeline } = usePipelineSelector();
  const { isOpen: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();

  const { summary, description, updatePipeline } = useBitriseYmlStore((s) => ({
    summary: s.yml.pipelines?.[pipelineId]?.summary || '',
    description: s.yml.pipelines?.[pipelineId]?.description || '',
    updatePipeline: s.updatePipeline,
  }));

  const renamePipeline = useRenamePipeline((newPipelineId) => {
    onSelectPipeline(newPipelineId);
  });

  const onNameChange = (value: string) => {
    setPipelineId(value);
    renamePipeline(value);
  };

  const validateName = (value: string) => {
    return PipelineService.validateName(
      value,
      keys.filter((key) => key !== pipelineId),
    );
  };

  const sanitizeName = (value: string) => {
    return PipelineService.sanitizeName(value);
  };

  const onDeletePipeline = useCallback(
    (deletedId: string) => {
      onDelete();
      onSelectPipeline(keys.filter((key) => key !== deletedId)[0]);
    },
    [keys, onDelete, onSelectPipeline],
  );

  return (
    <>
      <Box display="flex" flexDir="column" gap="24">
        <EditableInput
          isRequired
          name="name"
          label="Name"
          sanitize={sanitizeName}
          validate={validateName}
          onCommit={onNameChange}
          defaultValue={pipelineId}
        />
        <Textarea
          name="summary"
          label="Summary"
          value={summary}
          onChange={(e) => updatePipeline(pipelineId, { summary: e.target.value })}
        />
        <Textarea
          name="description"
          label="Description"
          value={description}
          onChange={(e) => updatePipeline(pipelineId, { description: e.target.value })}
        />
        <Button leftIconName="Trash" alignSelf="flex-start" variant="danger-secondary" onClick={onOpenDeleteDialog}>
          Delete Pipeline
        </Button>
      </Box>
      <DeletePipelineDialog
        pipelineId={pipelineId}
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onDeletePipeline={onDeletePipeline}
      />
    </>
  );
};

export default PropertiesTab;
