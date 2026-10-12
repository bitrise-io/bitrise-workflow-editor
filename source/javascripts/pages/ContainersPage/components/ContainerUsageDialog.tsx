import { Dialog, DialogBody, DialogFooter, DialogProps, Text } from '@bitrise/bitkit';
import { Separator } from '@chakra-ui/react/separator';

import { Container } from '@/core/models/Container';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainerUsageTable from './ContainerUsageTable';

type ContainerUsageDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: Container['id'];
};

const ContainerUsageDialog = (props: ContainerUsageDialogProps) => {
  const { isOpen, onClose, selectedContainerId } = props;
  const workflowsUsedByContainer = useContainerWorkflowUsage(selectedContainerId);
  return (
    <Dialog title="Container usage" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        Container{' '}
        <Text as="span" textStyle="body/lg/semibold">
          {selectedContainerId}
        </Text>{' '}
        is used in {workflowsUsedByContainer.length} Workflow{workflowsUsedByContainer.length !== 1 ? 's' : ''}.
        <ContainerUsageTable containerId={selectedContainerId} workflows={workflowsUsedByContainer} />
        <Separator />
      </DialogBody>
      <DialogFooter />
    </Dialog>
  );
};

export default ContainerUsageDialog;
