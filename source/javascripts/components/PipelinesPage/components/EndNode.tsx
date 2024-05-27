import { Box, Icon } from '@bitrise/bitkit';
import { NodeProps, Position } from 'reactflow';
import InvisibleHandle from './InvisibleHandle';

type Props = NodeProps;

const EndNode = (_props: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} />
      <Box
        w="24"
        h="24"
        bg="background/primary"
        display="flex"
        border="1px solid"
        alignItems="center"
        borderRadius="100%"
        justifyContent="center"
        borderColor="border/regular"
      >
        <Icon name="Flag" size="16" color="icon/tertiary" />
      </Box>
      <InvisibleHandle type="source" position={Position.Right} />
    </>
  );
};

export default EndNode;
