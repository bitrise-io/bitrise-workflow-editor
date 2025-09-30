import { Button, Dialog, DialogBody, DialogFooter, DialogProps, List, ListItem, Text } from '@bitrise/bitkit';
import { useCallback } from 'react';

import StepBundleService from '@/core/services/StepBundleService';

type Props = Omit<DialogProps, 'title'> & {
  stepBundleId: string;
  onDeleteStepBundle?: () => void;
};

const DeleteStepBundleDialog = ({ stepBundleId, onDeleteStepBundle, onClose, ...dialogProps }: Props) => {
  const handleDelete = useCallback(() => {
    StepBundleService.deleteStepBundle(stepBundleId);
    onDeleteStepBundle?.();
    onClose();
  }, [stepBundleId, onDeleteStepBundle, onClose]);

  return (
    <Dialog title="Delete Step bundle?" onClose={onClose} {...dialogProps}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{stepBundleId}</strong>?
        </Text>
        <List variant="unstyled" spacing="6">
          <ListItem iconSize="24" iconName="Cross" iconColor="icon/negative">
            All settings of this Step bundle will be deleted.
          </ListItem>
          <ListItem iconSize="24" iconName="Cross" iconColor="icon/negative">
            Dependent automated tasks, builds and deployments will stop functioning.
          </ListItem>
          <ListItem iconSize="24" iconName="Check" iconColor="icon/positive">
            Historical build logs will remain accessible.
          </ListItem>
        </List>
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

export default DeleteStepBundleDialog;
