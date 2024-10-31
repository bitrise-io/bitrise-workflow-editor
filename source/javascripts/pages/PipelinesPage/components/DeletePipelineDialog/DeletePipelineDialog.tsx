import { Button, Dialog, DialogBody, DialogFooter, DialogProps, List, ListItem, Text } from '@bitrise/bitkit';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = Omit<DialogProps, 'title'> & {
  onDeletePipeline: (pipelineId: string) => void;
};

const DeletePipelineDialog = ({ onDeletePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const { selectedPipeline: selectedPipelineId } = usePipelineSelector();

  const handleDelete = () => {
    onDeletePipeline(selectedPipelineId);
    onClose();
  };

  // TODO: closing the dialog without deleting closes the properties drawer as well
  return (
    <Dialog {...props} title="Create Pipeline" onClose={onClose} onCloseComplete={onCloseComplete}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{selectedPipelineId}</strong>?
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
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isDanger onClick={handleDelete}>
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeletePipelineDialog;
