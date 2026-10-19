import { Dialog, DialogBody, DialogFooter, DialogProps, List, ListItem, Text } from '@bitrise/bitkit';
import { BitkitButton } from '@bitrise/bitkit-v2';
import { useCallback } from 'react';

import WorkflowService from '@/core/services/WorkflowService';

type Props = Omit<DialogProps, 'title'> & {
  workflowId: string;
  onDeleteWorkflow?: (workflowId: string) => void;
};

const DeleteWorkflowDialog = ({ workflowId, onDeleteWorkflow, onClose, ...dialogProps }: Props) => {
  const handleDelete = useCallback(() => {
    WorkflowService.deleteWorkflow(workflowId);
    onDeleteWorkflow?.(workflowId);
    onClose();
  }, [workflowId, onDeleteWorkflow, onClose]);

  return (
    <Dialog title="Delete Workflow?" onClose={onClose} {...dialogProps}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{workflowId}</strong>?
        </Text>
        <List variant="unstyled" spacing="6" data-clarity-unmask="true">
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
        <Text textStyle="body/lg/semibold" data-clarity-unmask="true">
          This action cannot be undone after the YML is saved.
        </Text>
      </DialogBody>
      <DialogFooter data-clarity-unmask="true">
        <BitkitButton variant="secondary" onClick={onClose}>
          Cancel
        </BitkitButton>
        <BitkitButton variant="danger-primary" onClick={handleDelete}>
          Delete
        </BitkitButton>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWorkflowDialog;
