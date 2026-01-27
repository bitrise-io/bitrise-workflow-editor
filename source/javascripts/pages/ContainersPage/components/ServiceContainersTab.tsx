import { Box, Button, EmptyState, Text } from '@bitrise/bitkit';

const ServiceContainersTab = () => {
  return (
    <Box p="32px 32px 48px" display="flex" flexDir="column" gap="16">
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="32">
        <Text color="text/secondary">
          Use service containers to attach custom services you want to use during your Workflows.
        </Text>
        <Button variant="secondary" leftIconName="Plus" size="md" onClick={() => {}}>
          Add container
        </Button>
      </Box>
      <EmptyState
        title="Your service containers will appear here"
        description="Add your first service container to provide database or message queue support to your Steps and Step bundles."
        iconName="Container"
      />
    </Box>
  );
};

export default ServiceContainersTab;
