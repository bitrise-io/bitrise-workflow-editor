import { BitkitButton, BitkitDialog, BitkitList, IconCheck, IconCross } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { useCallback } from 'react';

import PipelineService from '@/core/services/PipelineService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  onDeletePipeline?: (pipelineId: string) => void;
};

const DeletePipelineDialog = ({ isOpen, pipelineId, onClose, onDeletePipeline }: Props) => {
  const handleDeletePipeline = useCallback(() => {
    PipelineService.deletePipeline(pipelineId);
    onDeletePipeline?.(pipelineId);
    onClose();
  }, [pipelineId, onDeletePipeline, onClose]);

  return (
    <BitkitDialog
      title="Delete Pipeline"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      footerButtons={
        <>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton variant="danger-primary" onClick={handleDeletePipeline}>
            Delete
          </BitkitButton>
        </>
      }
    >
      <Text>
        Are you sure you want to delete <strong>{pipelineId}</strong>?
      </Text>
      <BitkitList>
        <BitkitList.Item icon={IconCross} iconColor="icon/negative">
          All settings of this Pipeline will be deleted.
        </BitkitList.Item>
        <BitkitList.Item icon={IconCross} iconColor="icon/negative">
          Dependent automated tasks, builds and deployments will stop functioning.
        </BitkitList.Item>
        <BitkitList.Item icon={IconCheck} iconColor="icon/positive">
          Historical build logs will remain accessible.
        </BitkitList.Item>
      </BitkitList>
      <Text textStyle="body/lg/semibold">This action cannot be undone after the YML is saved.</Text>
    </BitkitDialog>
  );
};

export default DeletePipelineDialog;
