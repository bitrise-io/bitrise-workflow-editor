import { useCallback } from 'react';
import {
  addEdge,
  EdgeMouseHandler,
  EdgeTypes,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesDelete,
  OnNodesDelete,
  ReactFlow,
  ReactFlowProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { PipelineConfigDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useFeatureFlag from '@/hooks/useFeatureFlag';
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
  const { selectedPipeline } = usePipelineSelector();
  const isGraphPipelineEnabled = useFeatureFlag('enable-dag-pipelines');
  const { updateNode, updateEdgeData } = useReactFlow<Node<WorkflowNodeDataType>>();
  const initial = transformWorkflowsToNodesAndEdges(selectedPipeline, workflows, isGraphPipelineEnabled);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(autoLayoutingGraphNodes(initial.nodes));

  const { addPipelineWorkflowDependency, removeWorkflowFromPipeline, removePipelineWorkflowDependency } =
    useBitriseYmlStore((s) => ({
      removeWorkflowFromPipeline: s.removeWorkflowFromPipeline,
      addPipelineWorkflowDependency: s.addPipelineWorkflowDependency,
      removePipelineWorkflowDependency: s.removePipelineWorkflowDependency,
    }));

  const handleNodesChanges: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes(autoLayoutingGraphNodes);
    },
    [onNodesChange, setNodes],
  );

  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => {
        removePipelineWorkflowDependency(selectedPipeline, edge.target, edge.source);
        updateNode(edge.target, (node) => ({
          ...node,
          data: {
            ...node.data,
            dependsOn: node.data.dependsOn.filter((dId) => dId !== edge.source),
          },
        }));
      });
    },
    [selectedPipeline, removePipelineWorkflowDependency, updateNode],
  );

  const handleNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => {
        removeWorkflowFromPipeline(selectedPipeline, node.id);
      });
    },
    [removeWorkflowFromPipeline, selectedPipeline],
  );

  const handleConnect: OnConnect = useCallback(
    (params) => {
      addPipelineWorkflowDependency(selectedPipeline, params.target, params.source);
      setEdges((pervEdges) => addEdge({ ...params, type: GRAPH_EDGE_TYPE }, pervEdges));
      updateNode(params.target, (node) => ({
        ...node,
        data: {
          ...node.data,
          dependsOn: [...node.data.dependsOn, params.source],
        },
      }));
    },
    [selectedPipeline, addPipelineWorkflowDependency, setEdges, updateNode],
  );

  const handleEdgeMouseEnter: EdgeMouseHandler = useCallback(
    (_, { id }) => updateEdgeData(id, { highlighted: true }),
    [updateEdgeData],
  );

  const handleEdgeMouseLeave: EdgeMouseHandler = useCallback(
    (_, { id, target }) => {
      const targetNodeSelected = nodes.some((node) => node.id === target && node.selected);
      updateEdgeData(id, { highlighted: targetNodeSelected });
    },
    [updateEdgeData, nodes],
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleConnect}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={handleEdgesDelete}
        onNodesChange={handleNodesChanges}
        onNodesDelete={handleNodesDelete}
        onEdgeMouseMove={handleEdgeMouseEnter}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        connectionLineComponent={ConnectionGraphEdge}
        isValidConnection={validateConnection(nodes, edges)}
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
