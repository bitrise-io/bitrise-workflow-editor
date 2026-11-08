import { BitkitDialog } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';

import { Container } from '@/core/models/Container';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainerUsageTable from './ContainerUsageTable';

type ContainerUsageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedContainerId: Container['id'];
};

const ContainerUsageDialog = (props: ContainerUsageDialogProps) => {
  const { isOpen, onClose, selectedContainerId } = props;
  const workflowsUsedByContainer = useContainerWorkflowUsage(selectedContainerId);
  return (
    <BitkitDialog
      title="Container usage"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
    >
      <Text>
        Container{' '}
        <Text as="span" textStyle="body/lg/semibold">
          {selectedContainerId}
        </Text>{' '}
        is used in {workflowsUsedByContainer.length} Workflow
        {workflowsUsedByContainer.length !== 1 ? 's' : ''}.
      </Text>
      <ContainerUsageTable containerId={selectedContainerId} workflows={workflowsUsedByContainer} />
    </BitkitDialog>
  );
};

export default ContainerUsageDialog;
