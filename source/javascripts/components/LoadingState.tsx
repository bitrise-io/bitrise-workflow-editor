import { ProgressBitbot, Text } from '@bitrise/bitkit';
import { Box } from '@chakra-ui/react/box';

import { CANVAS_EDGE_SHADOW, canvasDotsBackground } from '@/components/unified-editor/canvasDots';

type Props = {
  text?: string;
  // Stands in for a canvas while it loads, with the canvas's gray, dots and inset edge, so nothing flips
  // from white to gray when the page arrives.
  isCanvas?: boolean;
};

const LoadingState = ({ text = 'Loading...', isCanvas }: Props) => {
  return (
    // `text` is a fixed UI label at every call site, so the whole placeholder is safe to unmask.
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      {...(isCanvas && { background: 'background/secondary', ...canvasDotsBackground, boxShadow: CANVAS_EDGE_SHADOW })}
      data-clarity-unmask="true"
    >
      <ProgressBitbot />
      <Text>{text}</Text>
    </Box>
  );
};

export default LoadingState;
