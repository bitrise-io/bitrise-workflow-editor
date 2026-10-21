import { IconPlay } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { NodeProps, Position } from '@xyflow/react';

import { ICON_STAGE_WIDTH } from '../StagedPipelineCanvas.const';
import InvisibleHandle from './InvisibleHandle';

type Props = NodeProps;

const RunNode = (_props: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} />
      <Box
        width={ICON_STAGE_WIDTH}
        height={ICON_STAGE_WIDTH}
        background="background/primary"
        display="flex"
        border="1px solid"
        alignItems="center"
        borderRadius="100%"
        justifyContent="center"
        borderColor="border/regular"
      >
        <IconPlay size="16" color="icon/tertiary" />
      </Box>
      <InvisibleHandle type="source" position={Position.Right} />
    </>
  );
};

export default RunNode;
