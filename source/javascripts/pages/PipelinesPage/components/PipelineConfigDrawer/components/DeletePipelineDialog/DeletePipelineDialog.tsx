import { Dialog, DialogBody, DialogFooter, DialogProps, List, ListItem } from '@bitrise/bitkit';
import { BitkitButton } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { useCallback } from 'react';

import PipelineService from '@/core/services/PipelineService';

type Props = Omit<DialogProps, 'title'> & {
  pipelineId: string;
  onDeletePipeline?: (pipelineId: string) => void;
};

const DeletePipelineDialog = ({ pipelineId, onClose, onDeletePipeline, ...props }: Props) => {
  const handleDeletePipeline = useCallback(() => {
    PipelineService.deletePipeline(pipelineId);
    onDeletePipeline?.(pipelineId);
    onClose();
  }, [pipelineId, onDeletePipeline, onClose]);

  return (
    <Dialog {...props} title="Delete Pipeline" onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{pipelineId}</strong>?
        </Text>
        <List variant="unstyled" spacing="6">
          <ListItem iconSize="24" iconName="Cross" iconColor="icon/negative">
            All settings of this Pipeline will be deleted.
          </ListItem>
          <ListItem iconSize="24" iconName="Cross" iconColor="icon/negative">
            Dependent automated tasks, builds and deployments will stop functioning.
          </ListItem>
          <ListItem iconSize="24" iconName="Check" iconColor="icon/positive">
            Historical build logs will remain accessible.
          </ListItem>
        </List>
        <Text textStyle="body/lg/semibold">This action cannot be undone after the YML is saved.</Text>
      </DialogBody>
      <DialogFooter>
        <BitkitButton variant="secondary" onClick={onClose}>
          Cancel
        </BitkitButton>
        <BitkitButton variant="danger-primary" onClick={handleDeletePipeline}>
          Delete
        </BitkitButton>
      </DialogFooter>
    </Dialog>
  );
};

export default DeletePipelineDialog;
