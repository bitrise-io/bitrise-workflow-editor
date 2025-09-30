import { Box, Text } from '@bitrise/bitkit';
import { Node, NodeProps, Position } from '@xyflow/react';

import WorkflowCard from '@/components/unified-editor/WorkflowCard/WorkflowCard';
import { Stage } from '@/core/models/Stage';

import { STAGE_WIDTH } from '../StagedPipelineCanvas.const';
import InvisibleHandle from './InvisibleHandle';

type Props = NodeProps<Node<Stage>>;

const StageNode = ({ id, data: stage }: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} style={{ top: 26 }} />
      <Box display="flex" flexDir="column" bg="background/tertiary" borderRadius="12" p="16" w={STAGE_WIDTH} gap="16">
        <Text textStyle="body/md/semibold">{stage.userValues.title || id}</Text>
        <Box display="flex" flexDir="column" gap="8">
          {stage.userValues.workflows?.map((wf, i) => {
            const wfId = Object.keys(wf)[0];
            // eslint-disable-next-line react/no-array-index-key
            return <WorkflowCard key={`${wfId}-${i}`} id={wfId} isCollapsable />;
          })}
        </Box>
      </Box>
      <InvisibleHandle type="source" position={Position.Right} style={{ top: 26 }} />
    </>
  );
};

export default StageNode;
