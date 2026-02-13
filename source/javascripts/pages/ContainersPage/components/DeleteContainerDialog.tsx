import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Divider, Text } from '@bitrise/bitkit';

import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import ContainerUsageTable from './ContainerUsageTable';

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
        <Text>
          The container will be permanently deleted.
          {type === 'definition' && workflowsUsedByContainer.length > 0 && (
            <Text as="span"> It will be removed from {workflowsUsedByContainer.length} Workflows.</Text>
          )}
        </Text>
        {type === 'definition' && workflowsUsedByContainer.length > 0 && (
          <>
            <ContainerUsageTable workflows={workflowsUsedByContainer} />
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
