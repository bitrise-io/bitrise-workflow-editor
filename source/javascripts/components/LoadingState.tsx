import { Box, ProgressBitbot, Text } from '@bitrise/bitkit';

const LoadingState = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    // `text` is a fixed UI label at every call site, so the whole placeholder is safe to unmask.
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      data-clarity-unmask="true"
    >
      <ProgressBitbot />
      <Text>{text}</Text>
    </Box>
  );
};

export default LoadingState;
