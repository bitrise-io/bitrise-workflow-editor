import {
  applyNodeChanges,
  EdgeMouseHandler,
  EdgeTypes,
  NodeTypes,
  OnConnect,
  OnEdgesDelete,
  OnNodesChange,
  OnNodesDelete,
  ReactFlow,
  ReactFlowProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { isEqual } from 'es-toolkit';
import { useCallback, useEffect, useState } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import GraphPipelineCanvasEmptyState from '../../EmptyStates/GraphPipelineCanvasEmptyState';
import GraphEdge, { ConnectionGraphEdge } from './components/GraphEdge';
import PlaceholderNode from './components/PlaceholderWorkflowNode';
import WorkflowNode from './components/WorkflowNode';
import { GRAPH_EDGE_TYPE, PLACEHOLDER_NODE_TYPE, WORKFLOW_NODE_TYPE } from './GraphPipelineCanvas.const';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from './GraphPipelineCanvas.types';
import usePipelineWorkflows from './hooks/usePipelineWorkflows';
import autoLayoutingGraphNodes from './utils/autoLayoutingGraphNodes';
import transformWorkflowsToGraphEntities from './utils/transformWorkflowsToGraphEntities';
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
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const { selectedPipeline } = usePipelineSelector();
  const [prevWorkflows, setPrevWorkflows] = useState(workflows);
  const initial = transformWorkflowsToGraphEntities(workflows);
  const { updateEdgeData } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();

  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [nodes, setNodes] = useNodesState(autoLayoutingGraphNodes(workflows, initial.nodes));

  const { addPipelineWorkflowDependency, removeWorkflowFromPipeline, removePipelineWorkflowDependency } =
    useBitriseYmlStore((s) => ({
      removeWorkflowFromPipeline: s.removeWorkflowFromPipeline,
      addPipelineWorkflowDependency: s.addPipelineWorkflowDependency,
      removePipelineWorkflowDependency: s.removePipelineWorkflowDependency,
    }));

  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => removePipelineWorkflowDependency(selectedPipeline, edge.target, edge.source));
    },
    [removePipelineWorkflowDependency, selectedPipeline],
  );

  const handleNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => removeWorkflowFromPipeline(selectedPipeline, node.id));
    },
    [removeWorkflowFromPipeline, selectedPipeline],
  );

  const handleConnect: OnConnect = useCallback(
    (params) => addPipelineWorkflowDependency(selectedPipeline, params.target, params.source),
    [addPipelineWorkflowDependency, selectedPipeline],
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

  const onNodesChange: OnNodesChange<GraphPipelineNodeType> = useCallback(
    (changes) => setNodes((nds) => autoLayoutingGraphNodes(workflows, applyNodeChanges(changes, nds))),
    [workflows, setNodes],
  );

  // Update nodes and edges when workflows change
  useEffect(() => {
    if (!isEqual(workflows, prevWorkflows)) {
      const entities = transformWorkflowsToGraphEntities(workflows);

      setNodes((nds) => {
        const newNodes = entities.nodes.map((node) => {
          const existingNode = nds.find((n) => n.id === node.id);

          if (existingNode) {
            existingNode.data = node.data;
            return existingNode;
          }

          return node;
        });

        return autoLayoutingGraphNodes(workflows, newNodes);
      });

      setEdges((eds) => {
        return entities.edges.map((edge) => eds.find((e) => e.id === edge.id) || edge);
      });

      setPrevWorkflows(workflows);
    }
  }, [workflows, prevWorkflows, setNodes, setEdges]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={handleEdgesDelete}
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
          onAddWorkflow={openDialog({
            type: PipelinesPageDialogType.WORKFLOW_SELECTOR,
            pipelineId: selectedPipeline,
          })}
        />
      )}
    </>
  );
};

export default GraphPipelineCanvas;
