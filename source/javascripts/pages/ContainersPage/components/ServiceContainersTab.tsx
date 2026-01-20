import { Box, Button, EmptyState, Text, useDisclosure } from '@bitrise/bitkit';

import CreateContainerDialog from '@/pages/ContainersPage/components/CreateContainerDialog';

const ServiceContainersTab = () => {
  const { isOpen: isCreateDialogOpen, onOpen: onCreateDialogOpen, onClose: onCreateDialogClose } = useDisclosure();

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use service containers to attach custom services you want to use during your Workflows.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={onCreateDialogOpen}>
          Add container
        </Button>
      </Box>
      <EmptyState
        title="Your service containers will appear here"
        description="Add your first service container to provide database or message queue support to your Steps and Step bundles."
        iconName="Container"
      />
      <CreateContainerDialog isOpen={isCreateDialogOpen} onClose={onCreateDialogClose} />
    </Box>
  );
};

export default ServiceContainersTab;
