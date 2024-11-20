import { Box, Icon, Text } from '@bitrise/bitkit';
import { NodeProps } from '@xyflow/react';

import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { LeftHandle } from './Handles';

type Props = NodeProps;

const PlaceholderNode = ({ zIndex }: Props) => {
  return (
    <Box display="flex" alignItems="stretch" h={WORKFLOW_NODE_HEIGHT} w={WORKFLOW_NODE_WIDTH} zIndex={zIndex}>
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
        <Icon color="icon/tertiary" name="PlusCircle" size="16" />
        <Text color="text/tertiary" textStyle="body/md/regular">
          Workflow
        </Text>
      </Box>
      <Box w={16} />
    </Box>
  );
};

export default PlaceholderNode;
