import ReactFlow, { EdgeTypes, NodeTypes, ReactFlowProps } from 'reactflow';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import useGraphPipeline from './hooks/useGraphPipeline';
import WorkflowNode from './components/WorkflowNode';
import GraphEdge from './components/GraphEdge';
import GraphPipelineCanvasEmptyState from './components/GraphPipelineCanvasEmptyState';

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
  'graph-edge': GraphEdge,
};

const GraphPipelineCanvas = (props: ReactFlowProps) => {
  const { nodes, edges } = useGraphPipeline();
  const { openDialog } = usePipelinesPageStore();

  const isPipelineEmpty = nodes.length === 0;

  if (isPipelineEmpty) {
    return <GraphPipelineCanvasEmptyState onAddWorkflow={openDialog(PipelineConfigDialogType.WORKFLOW_SELECTOR)} />;
  }

  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} {...props} />;
};

export default GraphPipelineCanvas;
