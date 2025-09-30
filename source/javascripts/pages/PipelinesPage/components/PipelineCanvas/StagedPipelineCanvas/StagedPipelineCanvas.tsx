import { NodeTypes, ReactFlow, ReactFlowProps } from '@xyflow/react';

import AddNode from './components/AddNode';
import EndNode from './components/EndNode';
import RunNode from './components/RunNode';
import StageNode from './components/StageNode';
import usePipelineStageEdges from './hooks/usePipelineStageEdges';
import usePipelineStageNodes from './hooks/usePipelineStageNodes';

const nodeTypes: NodeTypes = {
  add: AddNode,
  run: RunNode,
  end: EndNode,
  stage: StageNode,
};

const StagePipelineCanvas = (props: ReactFlowProps) => {
  const nodes = usePipelineStageNodes();
  const edges = usePipelineStageEdges(nodes);

  return <ReactFlow panOnScroll nodes={nodes} edges={edges} nodeTypes={nodeTypes} {...props} />;
};

export default StagePipelineCanvas;
