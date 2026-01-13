import { Button, EmptyState, Text } from '@bitrise/bitkit';
import { Box } from 'chakra-ui-2--react';

const ExecutionContainersTab = () => {
  return (
    <Box p="32px 32px 24px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use execution containers to create your custom environment to run your Steps in.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md">
          Add container
        </Button>
      </Box>
      <EmptyState
        title="Your execution containers will appear here"
        description="Add your first execution container to specify the tools, languages, and OS your Steps and Step bundles need to run."
      />
    </Box>
  );
};

export default ExecutionContainersTab;
