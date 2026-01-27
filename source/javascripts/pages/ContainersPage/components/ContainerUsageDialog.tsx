import {
  ControlButton,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';
import { Divider } from 'chakra-ui-2--react';

import { Container, ContainerSource } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type ContainerUsageDialogProps = Omit<DialogProps, 'title'> & {
  selectedContainerId: Container['id'];
  target: ContainerSource;
};

const ContainerUsageDialog = (props: ContainerUsageDialogProps) => {
  const { isOpen, onClose, selectedContainerId, target } = props;

  const yml = useBitriseYmlStore((s) => s.ymlDocument);
  const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(yml, selectedContainerId, target);

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
            {workflowsUsedByContainer.map((workflow) => (
              <Tr key={workflow}>
                <Td>
                  <Text textStyle="body /md/regular">{workflow}</Text>
                </Td>
                <Td width="60px" textAlign="right">
                  <ControlButton
                    as="a"
                    aria-label="Go to Workflow"
                    iconName="ArrowNorthEast"
                    href={`/workflows?workflow_id=${encodeURIComponent(workflow)}`}
                  />
                </Td>
              </Tr>
            ))}
            <Divider color="border/minimal" />
          </Tbody>
        </Table>
      </DialogBody>
      <DialogFooter />
    </Dialog>
  );
};

export default ContainerUsageDialog;
