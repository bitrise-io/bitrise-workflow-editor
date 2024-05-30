import { Box } from '@bitrise/bitkit';
import ReactFlow, { Controls, NodeTypes } from 'reactflow';
import usePipelineStageNodes from '../hooks/usePipelineStageNodes';
import usePipelineStageEdges from '../hooks/usePipelineStageEdges';
import StageNode from './StageNode';
import RunNode from './RunNode';
import AddNode from './AddNode';
import EndNode from './EndNode';

export const nodeTypes: NodeTypes = {
  add: AddNode,
  run: RunNode,
  end: EndNode,
  stage: StageNode,
};

const PipelinesCanvas = () => {
  const nodes = usePipelineStageNodes();
  const edges = usePipelineStageEdges(nodes);

  return (
    <Box bg="background/secondary" flex="1">
      <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} proOptions={{ hideAttribution: true }}>
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default PipelinesCanvas;
