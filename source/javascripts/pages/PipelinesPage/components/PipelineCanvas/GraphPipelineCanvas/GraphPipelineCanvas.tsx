import ReactFlow, { EdgeTypes, NodeTypes, ReactFlowProps } from 'reactflow';
import useGraphPipeline from './hooks/useGraphPipeline';
import WorkflowNode from './components/WorkflowNode';
import GraphEdge from './components/GraphEdge';

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
  'graph-edge': GraphEdge,
};

const GraphPipelineCanvas = (props: ReactFlowProps) => {
  const { nodes, edges } = useGraphPipeline();
  return <ReactFlow defaultNodes={nodes} defaultEdges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} {...props} />;
};

export default GraphPipelineCanvas;
