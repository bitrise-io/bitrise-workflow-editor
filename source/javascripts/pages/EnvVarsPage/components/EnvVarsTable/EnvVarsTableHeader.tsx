import { Box, Text } from '@bitrise/bitkit';

const EnvVarsTableHeader = () => {
  return (
    <Box
      pl="32"
      pr="48"
      as="header"
      height="48"
      display="flex"
      alignItems="center"
      textStyle="heading/h5"
      borderBottom="1px solid"
      borderColor="border/minimal"
    >
      <Text flex="1">Key</Text>
      <Text flex="1">Value</Text>
    </Box>
  );
};

export default EnvVarsTableHeader;
