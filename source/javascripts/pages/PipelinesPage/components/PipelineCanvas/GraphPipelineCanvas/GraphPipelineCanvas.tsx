import { useCallback } from 'react';
import {
  Edge,
  EdgeTypes,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowNode, { WorkflowNodeDataType } from './components/WorkflowNode/WorkflowNode';
import GraphEdge, { ConnectionGraphEdge } from './components/GraphEdge';
import GraphPipelineCanvasEmptyState from './components/GraphPipelineCanvasEmptyState';
import usePipelineWorkflows from './hooks/usePipelineWorkflows';
import transformWorkflowsToNodesAndEdges from './utils/transformWorkflowsToNodesAndEdges';
import autoLayoutingGraphNodes from './utils/autoLayoutingGraphNodes';
import PlaceholderNode from './components/WorkflowNode/PlaceholderWorkflowNode';
import { GRAPH_EDGE_TYPE, PLACEHOLDER_NODE_TYPE, WORKFLOW_NODE_TYPE } from './GraphPipelineCanvas.const';
import validateConnection from './utils/validateConnection';

const nodeTypes: NodeTypes = {
  [WORKFLOW_NODE_TYPE]: WorkflowNode,
  [PLACEHOLDER_NODE_TYPE]: PlaceholderNode,
};

const edgeTypes: EdgeTypes = {
  [GRAPH_EDGE_TYPE]: GraphEdge,
};

const GraphPipelineCanvas = (props: ReactFlowProps) => {
  const workflows = usePipelineWorkflows();
  const { openDialog } = usePipelinesPageStore();
  const { removeWorkflowFromPipeline, removePipelineWorkflowDependency } = useBitriseYmlStore((s) => ({
    removeWorkflowFromPipeline: s.removeWorkflowFromPipeline,
    removePipelineWorkflowDependency: s.removePipelineWorkflowDependency,
  }));

  const { updateNode } = useReactFlow<Node<WorkflowNodeDataType>>();
  const { selectedPipeline } = usePipelineSelector();
  const { nodes: initialNodes, edges: initialEdges } = transformWorkflowsToNodesAndEdges(selectedPipeline, workflows);

  const [nodes, setNodes, onNodesChange] = useNodesState(autoLayoutingGraphNodes(initialNodes));
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChanges: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes(autoLayoutingGraphNodes);
    },
    [onNodesChange, setNodes],
  );

  const updateAffectedNodes = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((e) => {
        updateNode(e.target, (node) => ({
          ...node,
          data: {
            ...node.data,
            dependsOn: node.data.dependsOn.filter((dId) => dId !== e.source),
          },
        }));
      });
    },
    [updateNode],
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={(deletedEdges) => {
          deletedEdges.forEach((edge) => {
            removePipelineWorkflowDependency(selectedPipeline, edge.target, edge.source);
          });
          updateAffectedNodes(deletedEdges);
        }}
        onNodesChange={handleNodesChanges}
        onNodesDelete={(deletedNodes) => {
          deletedNodes.forEach((node) => {
            removeWorkflowFromPipeline(selectedPipeline, node.id);
          });
        }}
        connectionLineComponent={ConnectionGraphEdge}
        isValidConnection={validateConnection(nodes)}
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
