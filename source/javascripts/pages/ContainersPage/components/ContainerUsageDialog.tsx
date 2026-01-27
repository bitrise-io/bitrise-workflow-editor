import {
  ControlButton,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Divider,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';

import { Container, ContainerSource } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useNavigation from '@/hooks/useNavigation';

type ContainerUsageDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: Container['id'];
  target: ContainerSource;
};

const ContainerUsageDialog = (props: ContainerUsageDialogProps) => {
  const { isOpen, onClose, selectedContainerId, target } = props;

  const yml = useBitriseYmlStore((s) => s.ymlDocument);
  const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(yml, selectedContainerId, target);
  const { replace } = useNavigation();

  return (
    <Dialog title="Container usage" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        Container{' '}
        <Text as="span" textStyle="body/lg/semibold">
          {selectedContainerId}
        </Text>{' '}
        is used in {workflowsUsedByContainer.length} Workflows.
        <Table isFixed variant="borderless" mt="24">
          <Thead>
            <Tr>
              <Th textStyle="heading/h5">Workflows</Th>
            </Tr>
          </Thead>
          <Tbody>
            {workflowsUsedByContainer.map((workflowId) => (
              <Tr key={workflowId}>
                <Td>
                  <Text textStyle="body/md/regular">{workflowId}</Text>
                </Td>
                <Td width="60px" textAlign="right">
                  <ControlButton
                    aria-label="Go to Workflow"
                    iconName="ArrowNorthEast"
                    onClick={() => replace('/workflows', { workflow_id: workflowId })}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Divider color="border/regular" />
      </DialogBody>
      <DialogFooter />
    </Dialog>
  );
};

export default ContainerUsageDialog;
