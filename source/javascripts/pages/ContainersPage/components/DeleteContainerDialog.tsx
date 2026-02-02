import { Box, Button, Dialog, DialogBody, DialogFooter, DialogProps, Divider, Icon, Text } from '@bitrise/bitkit';

import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import WorkflowsUsedByContainerTable from './WorkflowsUsedByContainerTable';

type DeleteContainerDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: string;
  type: 'definition' | 'reference';
};

const DeleteContainerDialog = (props: DeleteContainerDialogProps) => {
  const { isOpen, onClose, selectedContainerId, type } = props;

  const workflowsUsedByContainer = useBitriseYmlStore((state) =>
    ContainerService.getWorkflowsUsingContainer(state.ymlDocument, selectedContainerId),
  );

  return (
    <Dialog title="Delete container?" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <Text mb="24">
          Are you sure you want to delete{' '}
          <Text as="span" textStyle="body/lg/semibold">
            {selectedContainerId}?
          </Text>
        </Text>
        <Box display="flex" alignItems="center" gap="8">
          <Icon name="Cross" color="icon/negative" />
          <Text>All settings of this container will be deleted.</Text>
        </Box>
        {type === 'definition' && workflowsUsedByContainer.length > 0 && (
          <>
            <Box display="flex" alignItems="center" gap="8" mt="8">
              <Icon name="Cross" color="icon/negative" />
              <Text>All container usage will be deleted from the following Workflows:</Text>
            </Box>
            <WorkflowsUsedByContainerTable workflows={workflowsUsedByContainer} />
            <Divider color="border/regular" />
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger-primary"
          onClick={() => {
            ContainerService.deleteContainer(selectedContainerId);
            onClose();
          }}
        >
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteContainerDialog;
