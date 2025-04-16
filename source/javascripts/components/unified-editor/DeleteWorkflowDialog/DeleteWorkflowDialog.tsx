import { Button, Dialog, DialogBody, DialogFooter, DialogProps, List, ListItem, Text } from '@bitrise/bitkit';
import { useCallback } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = Omit<DialogProps, 'title'> & {
  workflowId: string;
  onDeleteWorkflow?: (workflowId: string) => void;
};

const DeleteWorkflowDialog = ({ workflowId, onDeleteWorkflow, onClose, ...dialogProps }: Props) => {
  const deleteWorkflow = useBitriseYmlStore((s) => s.deleteWorkflow);

  const handleDelete = useCallback(() => {
    deleteWorkflow(workflowId);
    onDeleteWorkflow?.(workflowId);
    onClose();
  }, [workflowId, deleteWorkflow, onDeleteWorkflow, onClose]);

  return (
    <Dialog title="Delete Workflow?" onClose={onClose} {...dialogProps}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{workflowId}</strong>?
        </Text>
        <List variant="unstyled" spacing="6">
          <ListItem iconSize="24" iconName="Cross" iconColor="icon/negative">
            All settings, Steps and EnvVars specific to this Workflow will be deleted.
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

export default DeleteWorkflowDialog;
