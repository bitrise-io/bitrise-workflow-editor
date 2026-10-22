import { IconPlusCircle } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { NodeProps } from '@xyflow/react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

type Props = NodeProps;

const PlaceholderNode = ({ zIndex }: Props) => {
  return (
    <Box display="flex" alignItems="stretch" height={WORKFLOW_NODE_HEIGHT} width={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
      <LeftHandle />
      <Box
        gap="8"
        flex="1"
        display="flex"
        borderRadius="8"
        border="1px dashed"
        alignItems="center"
        justifyContent="center"
        borderColor="border/regular"
        backgroundColor="background/primary"
      >
        <IconPlusCircle color="icon/tertiary" size="16" />
        <Text color="text/tertiary" textStyle="body/md/regular">
          Workflow
        </Text>
      </Box>
      <Box width="16" />
    </Box>
  );
};

export default PlaceholderNode;
