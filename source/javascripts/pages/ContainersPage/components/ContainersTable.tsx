import { ControlButton, Link, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';

import ContainerUsageDialog from './ContainerUsageDialog';

const ContainersTable = ({ target }: { target: ContainerType }) => {
  const containers = ContainerService.getAllContainers(target);

  const [selectedContainerId, setSelectedContainerId] = useState<Container['id']>('');
  const {
    isOpen: isContainerUsageDialogOpen,
    onOpen: onContainerUsageDialogOpen,
    onClose: onContainerUsageDialogClose,
  } = useDisclosure();

  return (
    <>
      <Table isFixed>
        <Thead>
          <Tr>
            <Th textStyle="heading/h5" width="160px">
              Unique ID
            </Th>
            <Th textStyle="heading/h5">Image</Th>
            <Th textStyle="heading/h5">Used in</Th>
            <Th width="120px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {containers.map((container) => {
            const workflowsUsedByContainer = ContainerService.getWorkflowsUsingContainer(container.id, target);

            const workflowCount = workflowsUsedByContainer.length;
            const usageLabel =
              workflowCount === 0 ? '(not used)' : workflowCount === 1 ? '1 Workflow' : `${workflowCount} Workflows`;

            return (
              <Tr key={container.id}>
                <Td>
                  <Text textStyle="body/md/regular">{container.id}</Text>
                </Td>
                <Td>
                  <Text textStyle="body/md/regular">{container.userValues.image}</Text>
                </Td>
                <Td>
                  {workflowCount === 0 ? (
                    <Text color="text/tertiary">{usageLabel}</Text>
                  ) : (
                    <Link
                      as="button"
                      colorScheme="purple"
                      onClick={() => {
                        onContainerUsageDialogOpen();
                        setSelectedContainerId(container.id);
                      }}
                    >
                      {usageLabel}
                    </Link>
                  )}
                </Td>
                <Td textAlign="right">
                  <ControlButton
                    aria-label="Edit container"
                    iconName="Pencil"
                    color="icon/primary"
                    onClick={() => {}}
                    mr="8"
                  />
                  <ControlButton
                    aria-label="Delete container"
                    iconName="MinusCircle"
                    color="icon/negative"
                    onClick={() => {}}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <ContainerUsageDialog
        isOpen={isContainerUsageDialogOpen}
        onClose={onContainerUsageDialogClose}
        selectedContainerId={selectedContainerId}
        target={target}
      />
    </>
  );
};

export default ContainersTable;
