import { Button, Dialog, DialogBody, DialogFooter, List, ListItem, Text } from '@bitrise/bitkit';
import { useDisclosure, UseDisclosureProps } from '@chakra-ui/react';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = UseDisclosureProps & {
  onDeleteWorkflow: (workflowId: string) => void;
};

const DeleteWorkflowDialog = ({ onDeleteWorkflow, ...disclosureProps }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const { isOpen, onClose } = useDisclosure(disclosureProps);
  const [{ id: selectedWorkflowId }, setSelectedWorkflow] = useSelectedWorkflow();

  const handleDelete = () => {
    setSelectedWorkflow(workflowIds.find((id) => id !== selectedWorkflowId));
    onDeleteWorkflow(selectedWorkflowId);
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
