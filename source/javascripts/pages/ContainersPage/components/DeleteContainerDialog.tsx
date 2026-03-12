import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Divider, Text } from '@bitrise/bitkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useContainers from '@/hooks/useContainers';

import ContainerUsageTable from './ContainerUsageTable';

type DeleteContainerDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: string;
  source: ContainerType;
  type: 'definition' | 'reference';
};

const DeleteContainerDialog = (props: DeleteContainerDialogProps) => {
  const { isOpen, onClose, selectedContainerId, source, type } = props;

  const { all: containers } = useContainers();
  const selectedContainer = containers.find((c) => c.id === selectedContainerId);

  const workflowsUsedByContainer = useBitriseYmlStore((state) =>
    ContainerService.getWorkflowsUsingContainer(state.ymlDocument, selectedContainerId),
  );

  const handleDelete = () => {
    ContainerService.deleteContainer(selectedContainerId);
    segmentTrack('Container Definition Deleted', {
      app_slug: PageProps.appSlug(),
      workspace_slug: GlobalProps.workspaceSlug(),
      container_type: source,
      container_unique_id: selectedContainerId,
      container_image: selectedContainer?.userValues.image,
      has_additional_param: selectedContainer?.userValues.options ? true : false,
      has_port_mappings:
        selectedContainer?.userValues.ports && selectedContainer.userValues.ports.length > 0 ? true : false,
      has_env_vars: selectedContainer?.userValues.envs && selectedContainer.userValues.envs.length > 0 ? true : false,
      number_of_env_vars_defined: selectedContainer?.userValues.envs?.length,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
    segmentTrack('Delete Container Popup Dismissed', {
      app_slug: PageProps.appSlug(),
      workspace_slug: GlobalProps.workspaceSlug(),
      container_type: source,
      container_unique_id: selectedContainerId,
      container_image: selectedContainer?.userValues.image,
      has_additional_param: selectedContainer?.userValues.options ? true : false,
      has_port_mappings:
        selectedContainer?.userValues.ports && selectedContainer.userValues.ports.length > 0 ? true : false,
      has_env_vars: selectedContainer?.userValues.envs && selectedContainer.userValues.envs.length > 0 ? true : false,
      number_of_env_vars_defined: selectedContainer?.userValues.envs?.length || 0,
    });
  };

  return (
    <Dialog title="Delete container?" isOpen={isOpen} onClose={handleClose}>
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
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger-primary" onClick={handleDelete}>
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteContainerDialog;
