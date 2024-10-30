import ReactFlow, { NodeTypes, ReactFlowProps } from 'reactflow';
import usePipelineStageNodes from './hooks/usePipelineStageNodes';
import usePipelineStageEdges from './hooks/usePipelineStageEdges';
import AddNode from './components/AddNode';
import RunNode from './components/RunNode';
import EndNode from './components/EndNode';
import StageNode from './components/StageNode';

const nodeTypes: NodeTypes = {
  add: AddNode,
  run: RunNode,
  end: EndNode,
  stage: StageNode,
};

const StagePipelineCanvas = (props: ReactFlowProps) => {
  const nodes = usePipelineStageNodes();
  const edges = usePipelineStageEdges(nodes);

  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} {...props} />;
};

export default StagePipelineCanvas;
