import { useCallback } from 'react';
import { EdgeTypes, NodeTypes, ReactFlow, ReactFlowProps, useEdgesState, useNodesState } from '@xyflow/react';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import WorkflowNode from './components/WorkflowNode/WorkflowNode';
import GraphEdge, { ConnectionGraphEdge } from './components/GraphEdge';
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
  const { nodes: initialNodes, edges: initialEdges } = transformWorkflowsToNodesAndEdges(selectedPipeline, workflows);

  const [nodes, setNodes, onNodesChange] = useNodesState(autoLayoutingGraphNodes(initialNodes));
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  console.log('GraphPipelineCanvas', { nodes, edges });

  const autoLayoutOnNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes(autoLayoutingGraphNodes);
    },
    [onNodesChange, setNodes],
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onNodesChange={autoLayoutOnNodesChange}
        connectionLineComponent={ConnectionGraphEdge}
        {...props}
      />
      {nodes.length === 0 && (
        <GraphPipelineCanvasEmptyState
          inset="0"
          position="absolute"
          onAddWorkflow={openDialog(PipelineConfigDialogType.WORKFLOW_SELECTOR, selectedPipeline)}
        />
      )}
    </>
  );
};

export default GraphPipelineCanvas;
