import { Box, Text } from '@bitrise/bitkit';

type Props = {
  workflowId?: string;
};

const ToolVersions = ({ workflowId }: Props) => {
  return (
    <Box>
      <Text as="h4" textStyle="heading/h4" mb="12">
        {workflowId ? `Tool setup for ${workflowId}` : 'Tool setup'}
      </Text>
      <Text textStyle="body/md/regular" color="text/secondary">
        Tool version setup coming soon.
      </Text>
    </Box>
  );
};

export default ToolVersions;
