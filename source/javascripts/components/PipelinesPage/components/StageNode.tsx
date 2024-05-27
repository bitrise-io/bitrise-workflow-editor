import { Box, Card, Text } from '@bitrise/bitkit';
import { NodeProps, Position } from 'reactflow';
import { Stage } from '../PipelinesPage.types';
import { STAGE_WIDTH } from '../PipelinesPage.const';
import InvisibleHandle from './InvisibleHandle';

type Props = NodeProps<Stage>;

const StageNode = ({ id, data: stage }: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} style={{ top: 26 }} />
      <Box display="flex" flexDir="column" bg="background/tertiary" borderRadius="12" p="16" w={STAGE_WIDTH} gap="16">
        <Text textStyle="body/md/semibold">{stage.title || id}</Text>
        <Box display="flex" flexDir="column" gap="8">
          <Card variant="outline" borderRadius="8" h="48px" />
          <Card variant="outline" borderRadius="8" h="48px" />
          <Card variant="outline" borderRadius="8" h="48px" />
          <Card variant="outline" borderRadius="8" h="48px" />
        </Box>
      </Box>
      <InvisibleHandle type="source" position={Position.Right} style={{ top: 26 }} />
    </>
  );
};

export default StageNode;
