import { Box, Icon } from '@bitrise/bitkit';
import { NodeProps, Position } from 'reactflow';
import { ICON_STAGE_WIDTH } from '../StagedPipelineCanvas.const';
import InvisibleHandle from './InvisibleHandle';

type Props = NodeProps;

const AddNode = (_props: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} />
      <Box
        w={ICON_STAGE_WIDTH}
        h={ICON_STAGE_WIDTH}
        bg="background/primary"
        display="flex"
        border="1px solid"
        alignItems="center"
        borderRadius="100%"
        justifyContent="center"
        borderColor="border/regular"
      >
        <Icon name="ArrowRight" size="16" color="icon/tertiary" />
      </Box>
      <InvisibleHandle type="source" position={Position.Right} />
    </>
  );
};

export default AddNode;
