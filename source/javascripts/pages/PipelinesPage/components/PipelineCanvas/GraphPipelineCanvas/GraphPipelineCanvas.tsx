import { useCallback } from 'react';
import { ReactFlow, EdgeTypes, NodeTypes, ReactFlowProps, useEdgesState, useNodesState } from '@xyflow/react';
import { Box } from '@bitrise/bitkit';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import WorkflowNode from './components/WorkflowNode';
import GraphEdge from './components/GraphEdge';
import GraphPipelineCanvasEmptyState from './components/GraphPipelineCanvasEmptyState';
import usePipelineWorkflows from './hooks/usePipelineWorkflows';
import transformWorkflowsToNodesAndEdges from './utils/transformWorkflowsToNodesAndEdges';
import autoLayoutingGraphNodes from './utils/autoLayoutingGraphNodes';

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
  'graph-edge': GraphEdge,
};

const GraphPipelineCanvas = (props: ReactFlowProps) => {
  const workflows = usePipelineWorkflows();
  const { openDialog } = usePipelinesPageStore();
  const { selectedPipeline } = usePipelineSelector();
  const { nodes: initialNodes, edges: initialEdges } = transformWorkflowsToNodesAndEdges(workflows);

  const [nodes, setNodes, onNodesChange] = useNodesState(autoLayoutingGraphNodes(initialNodes));
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const autoLayoutOnNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes(autoLayoutingGraphNodes);
    },
    [onNodesChange, setNodes],
  );

  if (nodes.length === 0) {
    return (
      <Box pt="128">
        <GraphPipelineCanvasEmptyState
          onAddWorkflow={openDialog(PipelineConfigDialogType.WORKFLOW_SELECTOR, selectedPipeline)}
        />
      </Box>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onNodesChange={autoLayoutOnNodesChange}
      {...props}
    />
  );
};

export default GraphPipelineCanvas;
