import { Box, Button, EmptyState, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainersTable from './ContainersTable';
import CreateContainerDialog from './CreateContainerDialog';

const ExecutionContainersTab = () => {
  const [editedContainer, setEditedContainer] = useState<Container | null>(null);
  const containerUsageLookup = useContainerWorkflowUsage();
  const containers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });

  const { isOpen: isCreateDialogOpen, onOpen: onCreateDialogOpen, onClose: onCreateDialogClose } = useDisclosure();

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={onCreateDialogOpen}>
          Add container
        </Button>
      </Box>
      {containers.length > 0 ? (
        <ContainersTable
          containers={containers}
          containerUsageLookup={containerUsageLookup}
          openCreateDialog={onCreateDialogOpen}
          setEditedContainer={setEditedContainer}
        />
      ) : (
        <EmptyState
          title="Your execution containers will appear here"
          description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
          iconName="Container"
        />
      )}
      <CreateContainerDialog
        editedContainer={editedContainer}
        setEditedContainer={setEditedContainer}
        isOpen={isCreateDialogOpen}
        onClose={onCreateDialogClose}
        type="execution"
      />
    </Box>
  );
};

export default ExecutionContainersTab;
