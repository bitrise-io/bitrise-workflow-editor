import { Box, Text } from '@bitrise/bitkit';
import { NodeProps, Position } from 'reactflow';
import { STAGE_WIDTH } from '../PipelinesPage.const';
import WorkflowCard from '../../../components/WorkflowCard/WorkflowCard';
import InvisibleHandle from './InvisibleHandle';
import { Stage } from '@/models/Stage';

type Props = NodeProps<Stage>;

const StageNode = ({ id, data: stage }: Props) => {
  return (
    <>
      <InvisibleHandle type="target" position={Position.Left} style={{ top: 26 }} />
      <Box display="flex" flexDir="column" bg="background/tertiary" borderRadius="12" p="16" w={STAGE_WIDTH} gap="16">
        <Text textStyle="body/md/semibold">{stage.title || id}</Text>
        <Box display="flex" flexDir="column" gap="8">
          {stage.workflows?.map((wf, i) => {
            const wfId = Object.keys(wf)[0];
            // eslint-disable-next-line react/no-array-index-key
            return <WorkflowCard key={`${wfId}-${i}`} workflowId={wfId} />;
          })}
        </Box>
      </Box>
      <InvisibleHandle type="source" position={Position.Right} style={{ top: 26 }} />
    </>
  );
};

export default StageNode;
