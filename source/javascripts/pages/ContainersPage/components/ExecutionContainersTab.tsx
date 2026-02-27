import { Box, Button, EmptyState, Text, useDisclosure } from '@bitrise/bitkit';
import { useState } from 'react';

import { Container, ContainerType } from '@/core/models/Container';
import useContainers from '@/hooks/useContainers';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';

import ContainersTable from './ContainersTable';
import CreateOrEditContainerDialog from './CreateOrEditContainerDialog';

const ExecutionContainersTab = () => {
  const containerUsageLookup = useContainerWorkflowUsage();
  const { [ContainerType.Execution]: containers } = useContainers();

  const [editedContainer, setEditedContainer] = useState<Container | null>(null);
  const { isOpen: isDialogOpen, onOpen: onDialogOpen, onClose: onDialogClose } = useDisclosure();

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={['12', '32']}
        flexWrap="wrap"
        marginBlockEnd="16"
      >
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
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
          title="Your execution containers will appear here"
          description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
          iconName="Container"
        />
      )}
      <CreateOrEditContainerDialog
        editedContainer={editedContainer}
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        onCloseComplete={() => setEditedContainer(null)}
        type="execution"
      />
    </>
  );
};

export default ExecutionContainersTab;
