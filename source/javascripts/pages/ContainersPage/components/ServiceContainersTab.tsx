import { Box, Button, EmptyState, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainersTable from './ContainersTable';
import CreateOrEditContainerDialog from './CreateOrEditContainerDialog';

const ServiceContainersTab = () => {
  const containerUsageLookup = useContainerWorkflowUsage();
  const containers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const [editedContainer, setEditedContainer] = useState<Container | null>(null);
  const { isOpen: isDialogOpen, onOpen: onDialogOpen, onClose: onDialogClose } = useDisclosure();

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={['12', '32']} flexWrap="wrap">
        <Text color="text/secondary">
          Use service containers to attach custom services you want to use during your Workflows.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" minW={['100%', 'auto']} onClick={onDialogOpen}>
          Add container
        </Button>
      </Box>
      {containers.length > 0 ? (
        <ContainersTable
          containers={containers}
          containerUsageLookup={containerUsageLookup}
          openDialog={onDialogOpen}
          setEditedContainer={setEditedContainer}
        />
      ) : (
        <EmptyState
          title="Your service containers will appear here"
          description="Add your first service container to provide database or message queue support to your Steps and Step bundles."
          iconName="Container"
        />
      )}
      <CreateOrEditContainerDialog
        editedContainer={editedContainer}
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        setEditedContainer={setEditedContainer}
        type="service"
      />
    </Box>
  );
};

export default ServiceContainersTab;
