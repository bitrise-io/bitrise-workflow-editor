import { Box, Button, EmptyState, Text } from '@bitrise/bitkit';

import { ContainerSource } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import ContainersTable from '@/pages/ContainersPage/components/ContainersTable';

const ExecutionContainersTab = () => {
  const yml = useBitriseYmlStore((s) => s.ymlDocument);
  const containers = ContainerService.getAllContainers(yml, ContainerSource.Execution);

  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={() => {}}>
          Add container
        </Button>
      </Box>
      {containers.length > 0 ? (
        <ContainersTable target={ContainerSource.Execution} />
      ) : (
        <EmptyState
          title="Your execution containers will appear here"
          description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
          iconName="Container"
        />
      )}
    </Box>
  );
};

export default ExecutionContainersTab;
