import { Dialog, DialogBody, DialogFooter, DialogProps, Divider, Text } from '@bitrise/bitkit';

import { Container } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';

import WorkflowsUsedByContainerTable from './WorkflowsUsedByContainerTable';

type ContainerUsageDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: Container['id'];
};

const ContainerUsageDialog = (props: ContainerUsageDialogProps) => {
  const { isOpen, onClose, selectedContainerId } = props;
  const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(selectedContainerId);

  return (
    <Dialog title="Container usage" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        Container{' '}
        <Text as="span" textStyle="body/lg/semibold">
          {selectedContainerId}
        </Text>{' '}
        is used in {workflowsUsedByContainer.length} Workflow{workflowsUsedByContainer.length !== 1 ? 's' : ''}.
        <WorkflowsUsedByContainerTable workflows={workflowsUsedByContainer} />
        <Divider color="border/regular" />
      </DialogBody>
      <DialogFooter />
    </Dialog>
  );
};

export default ContainerUsageDialog;
