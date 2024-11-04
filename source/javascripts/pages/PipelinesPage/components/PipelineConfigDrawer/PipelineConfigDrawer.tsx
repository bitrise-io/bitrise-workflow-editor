import { Button, Text, Textarea, useDisclosure } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import EditableInput from '@/components/EditableInput/EditableInput';
import PipelineService from '@/core/models/PipelineService';
import usePipelineSelector from '../../hooks/usePipelineSelector';
import useRenamePipeline from '../../hooks/useRenamePipeline';
import { usePipelinesPageStore } from '../../PipelinesPage.store';
import DeletePipelineDialog from './components/DeletePipelineDialog/DeletePipelineDialog';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
};

// TODO: Uncomment the Delete Pipeline button when feature is implemented
const PipelineConfigDrawer = ({ pipelineId, ...props }: Props) => {
  const { setPipelineId } = usePipelinesPageStore();
  const { onSelectPipeline, keys } = usePipelineSelector();
  const deletePipeline = useBitriseYmlStore((s) => s.deletePipeline);

  const {
    isOpen: isOpenDeletionDialog,
    onOpen: onOpenDeleteionDialog,
    onClose: onCloseDeletionDialog,
  } = useDisclosure();

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

  const onDeletePipeline = () => {
    props.onClose();
    onCloseDeletionDialog();
    deletePipeline(pipelineId);
    onSelectPipeline(keys.filter((key) => key !== pipelineId)[0]);
  };

  if (!pipelineId) {
    return null;
  }

  return (
    <>
      <FloatingDrawer {...props}>
        <FloatingDrawerOverlay />
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Text as="h3" textStyle="heading/h3">
              {pipelineId}
            </Text>
          </FloatingDrawerHeader>
          <FloatingDrawerBody display="flex" flexDir="column" gap="24">
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
            <Button
              leftIconName="Trash"
              alignSelf="flex-start"
              variant="danger-secondary"
              onClick={onOpenDeleteionDialog}
            >
              Delete Pipeline
            </Button>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>

      <DeletePipelineDialog
        pipelineId={pipelineId}
        isOpen={isOpenDeletionDialog}
        onClose={onCloseDeletionDialog}
        onDeletePipeline={onDeletePipeline}
      />
    </>
  );
};

export default PipelineConfigDrawer;
