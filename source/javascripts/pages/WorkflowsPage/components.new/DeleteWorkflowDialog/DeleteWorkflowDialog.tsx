import { Button, Dialog, DialogBody, DialogFooter, List, ListItem, Text } from '@bitrise/bitkit';
import { useDisclosure, UseDisclosureProps } from '@chakra-ui/react';
import { useShallow } from 'zustand/react/shallow';
import useSelectWorkflow from '../../hooks/useSelectWorkflow';
import useWorkflowIds from '../../hooks/useWorkflowIds';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = UseDisclosureProps & {};

const DeleteWorkflowDialog = ({ ...disclosureProps }: Props) => {
  const workflowIds = useWorkflowIds();
  const { isOpen, onClose } = useDisclosure(disclosureProps);
  const [{ id: selectedWorkflowId }, setSelectedWorkflow] = useSelectWorkflow();
  const deleteWorkflow = useBitriseYmlStore(useShallow((s) => s.deleteWorkflow));

  const handleDelete = () => {
    deleteWorkflow(selectedWorkflowId);
    setSelectedWorkflow(workflowIds.find((id) => id !== selectedWorkflowId));
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} title="Delete Workflow?" onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="24">
        <Text>
          Are you sure you want to delete <strong>{selectedWorkflowId}</strong>?
        </Text>
        <List variant="unstyled" spacing="6">
          <ListItem iconSize="24" iconName="CloseSmall" iconColor="icon/negative">
            All settings, Steps and EnvVars specific to this Workflow will be deleted.
          </ListItem>
          <ListItem iconSize="24" iconName="CloseSmall" iconColor="icon/negative">
            Dependent automated tasks, builds and deployments will stop functioning.
          </ListItem>
          <ListItem iconSize="24" iconName="Tick" iconColor="icon/positive">
            Historical build logs will remain accessible.
          </ListItem>
        </List>
        <Text textStyle="body/lg/semibold">This action cannot be undone.</Text>
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
