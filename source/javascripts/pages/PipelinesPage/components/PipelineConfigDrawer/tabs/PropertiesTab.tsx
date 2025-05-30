import { Box, Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import { useCallback } from 'react';

import EditableInput from '@/components/EditableInput/EditableInput';
import PriorityInput from '@/components/unified-editor/PriorityInput/PriorityInput';
import GitStatusNameInput from '@/components/unified-editor/WorkflowConfig/components/GitStatusNameInput';
import PipelineService from '@/core/services/PipelineService';
import { getBitriseYml } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import useRenamePipeline from '@/pages/PipelinesPage/hooks/useRenamePipeline';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import DeletePipelineDialog from '../components/DeletePipelineDialog/DeletePipelineDialog';

type Props = {
  onDelete: () => void;
  pipelineId: string;
};

const NameInput = ({ pipelineId }: Pick<Props, 'pipelineId'>) => {
  const { keys, onSelectPipeline } = usePipelineSelector();
  const setPipelineId = usePipelinesPageStore((s) => s.setPipelineId);

  const renamePipeline = useRenamePipeline((newPipelineId) => {
    onSelectPipeline(newPipelineId);
  });

  const handleCommit = useCallback(
    (value: string) => {
      if (value !== pipelineId) {
        setPipelineId(value);
        renamePipeline(value);
      }
    },
    [pipelineId, setPipelineId, renamePipeline],
  );

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      defaultValue={pipelineId}
      sanitize={PipelineService.sanitizeName}
      validate={(name) => PipelineService.validateName(name, pipelineId, keys)}
      onCommit={handleCommit}
    />
  );
};

const SummaryInput = ({ pipelineId }: Pick<Props, 'pipelineId'>) => {
  const defaultValue = getBitriseYml().pipelines?.[pipelineId]?.summary || '';

  return (
    <Textarea
      name="summary"
      label="Summary"
      defaultValue={defaultValue}
      onChange={(e) => PipelineService.updatePipelineField(pipelineId, 'summary', e.target.value)}
    />
  );
};

const DescriptionInput = ({ pipelineId }: Pick<Props, 'pipelineId'>) => {
  const defaultValue = getBitriseYml().pipelines?.[pipelineId]?.description || '';

  return (
    <Textarea
      name="description"
      label="Description"
      defaultValue={defaultValue}
      onChange={(e) => PipelineService.updatePipelineField(pipelineId, 'description', e.target.value)}
    />
  );
};

const Priority = ({ pipelineId }: Pick<Props, 'pipelineId'>) => {
  const value = useBitriseYmlStore((s) => s.yml.pipelines?.[pipelineId]?.priority);

  return (
    <PriorityInput
      value={value}
      helperText="Set priority between -100 and +100. Default value is 0. Available on certain plans only."
      onChange={(newValue) => PipelineService.updatePipelineField(pipelineId, 'priority', newValue)}
    />
  );
};

const GitStatusName = ({ pipelineId }: Pick<Props, 'pipelineId'>) => {
  const value = useBitriseYmlStore((s) => s.yml.pipelines?.[pipelineId]?.status_report_name);

  return (
    <GitStatusNameInput
      targetId={pipelineId}
      statusReportName={value || ''}
      onChange={(newValue) => PipelineService.updatePipelineField(pipelineId, 'status_report_name', newValue)}
    />
  );
};

const PropertiesTab = ({ onDelete, pipelineId }: Props) => {
  const { keys, onSelectPipeline } = usePipelineSelector();
  const { isOpen: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();

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
        <NameInput pipelineId={pipelineId} />
        <SummaryInput pipelineId={pipelineId} />
        <DescriptionInput pipelineId={pipelineId} />
        <Priority pipelineId={pipelineId} />
        <GitStatusName pipelineId={pipelineId} />

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
