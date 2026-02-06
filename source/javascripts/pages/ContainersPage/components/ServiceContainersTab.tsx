import { Box, Button, EmptyState, Text, useDisclosure } from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainersTable from './ContainersTable';
import CreateContainerDialog from './CreateContainerDialog';

const ServiceContainersTab = () => {
  const containerUsageLookup = useContainerWorkflowUsage();
  const containers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const { isOpen: isCreateDialogOpen, onOpen: onCreateDialogOpen, onClose: onCreateDialogClose } = useDisclosure();

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={['12', '32']} flexWrap="wrap">
        <Text color="text/secondary">
          Use service containers to attach custom services you want to use during your Workflows.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" minW={['100%', 'auto']} onClick={onCreateDialogOpen}>
          Add container
        </Button>
      </Box>
      {containers.length > 0 ? (
        <ContainersTable containers={containers} containerUsageLookup={containerUsageLookup} />
      ) : (
        <EmptyState
          title="Your service containers will appear here"
          description="Add your first service container to provide database or message queue support to your Steps and Step bundles."
          iconName="Container"
        />
      )}
      <CreateContainerDialog isOpen={isCreateDialogOpen} onClose={onCreateDialogClose} type="service" />
    </Box>
  );
};

export default ServiceContainersTab;
