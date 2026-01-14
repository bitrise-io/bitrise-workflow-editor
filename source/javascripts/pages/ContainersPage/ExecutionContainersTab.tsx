import { Button, EmptyState, Text } from '@bitrise/bitkit';
import { Box, useDisclosure } from 'chakra-ui-2--react';

import CreateExecutionContainerDialog from '@/pages/ContainersPage/CreateExecutionContainerDialog';

const ExecutionContainersTab = () => {
  const { isOpen: isCreateDialogOpen, onOpen: onCreateDialogOpen, onClose: onCreateDialogClose } = useDisclosure();

  return (
    <Box p="32px 32px 24px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={onCreateDialogOpen}>
          Add container
        </Button>
      </Box>
      <EmptyState
        title="Your execution containers will appear here"
        description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
      />
      <CreateExecutionContainerDialog isOpen={isCreateDialogOpen} onClose={onCreateDialogClose} />
    </Box>
  );
};

export default ExecutionContainersTab;
