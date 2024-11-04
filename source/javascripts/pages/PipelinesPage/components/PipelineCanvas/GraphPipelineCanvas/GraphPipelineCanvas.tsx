import { useEffect } from 'react';
import ReactFlow, { EdgeTypes, Node, NodeTypes, ReactFlowProps, useEdgesState, useNodesState } from 'reactflow';
import { Box } from '@bitrise/bitkit';
import isEqual from 'lodash/isEqual';
import isEqualWith from 'lodash/isEqualWith';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { PipelineWorkflow } from '@/core/models/Workflow';
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
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = transformWorkflowsToNodesAndEdges(workflows);

    const nodesAreEqual = isEqualWith(nodes, newNodes, (a: Node<PipelineWorkflow>[], b: Node<PipelineWorkflow>[]) => {
      return isEqual(
        a.map(({ data }) => data),
        b.map(({ data }) => data),
      );
    });

    if (!nodesAreEqual) {
      setNodes(autoLayoutingGraphNodes(newNodes));
    }

    if (!isEqual(edges, newEdges)) {
      setEdges(newEdges);
    }
  }, [workflows, edges, nodes, setNodes, setEdges]);

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
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      {...props}
    />
  );
};

export default GraphPipelineCanvas;
