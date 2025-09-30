import { Box, ProgressBitbot, Text } from '@bitrise/bitkit';

const LoadingState = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
      <ProgressBitbot />
      <Text>{text}</Text>
    </Box>
  );
};

export default LoadingState;
