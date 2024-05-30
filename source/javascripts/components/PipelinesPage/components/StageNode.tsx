import { Box, Text } from '@bitrise/bitkit';
import { NodeProps, Position } from 'reactflow';
import { Stage } from '../PipelinesPage.types';
import { STAGE_WIDTH } from '../PipelinesPage.const';
import InvisibleHandle from './InvisibleHandle';
import WorkflowCard from './WorkflowCard/WorkflowCard';

type Props = NodeProps<Stage>;

const StageNode = ({ id, data: stage }: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} style={{ top: 26 }} />
      <Box display="flex" flexDir="column" bg="background/tertiary" borderRadius="12" p="16" w={STAGE_WIDTH} gap="16">
        <Text textStyle="body/md/semibold">{stage.title || id}</Text>
        <Box display="flex" flexDir="column" gap="8">
          {stage.workflows?.map((wf) => {
            const wfId = Object.keys(wf)[0];
            return <WorkflowCard key={wfId} id={wfId} />;
          })}
        </Box>
      </Box>
      <InvisibleHandle type="source" position={Position.Right} style={{ top: 26 }} />
    </>
  );
};

export default StageNode;
