import {
  applyNodeChanges,
  EdgeMouseHandler,
  EdgeTypes,
  NodeMouseHandler,
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
  useStoreApi,
} from '@xyflow/react';
import { isEqual } from 'es-toolkit';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsBehindToolPanel } from '@/components/Navigation/ToolPanel';
import { floatingDrawerCoveredWidth } from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import useDeleteSelectedStepsOnKey, {
  hasSelectedSteps,
} from '@/components/unified-editor/WorkflowCard/hooks/useDeleteSelectedStepsOnKey';
import { isWorkflowDefined } from '@/components/unified-editor/WorkflowConfig/WorkflowConfigDrawer';
import PipelineService from '@/core/services/PipelineService';
import { getBitriseYml } from '@/core/stores/BitriseYmlStore';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import GraphPipelineCanvasEmptyState from '../../EmptyStates/GraphPipelineCanvasEmptyState';
import AddWorkflowNode from './components/AddWorkflowNode';
import GeneratedWorkflowsPlaceholderNode from './components/GeneratedWorkflowsPlaceholderNode';
import GraphEdge, { ConnectionGraphEdge } from './components/GraphEdge';
import PlaceholderNode from './components/PlaceholderWorkflowNode';
import TriggerNode from './components/TriggerNode';
import WorkflowNode from './components/WorkflowNode';
import {
  ADD_WORKFLOW_NODE_TYPE,
  CANVAS_PADDING,
  GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE,
  GRAPH_EDGE_TYPE,
  PLACEHOLDER_NODE_TYPE,
  TRIGGER_NODE_TYPE,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_TYPE,
  WORKFLOW_NODE_WIDTH,
} from './GraphPipelineCanvas.const';
import { GraphPipelineEdgeType, GraphPipelineNodeType, isWorkflowNode } from './GraphPipelineCanvas.types';
import usePipelineWorkflows from './hooks/usePipelineWorkflows';
import addCanvasControls from './utils/addCanvasControls';
import { estimateExpandedHeight, useAutoExpandedNode } from './utils/autoExpandedNode';
import autoLayoutingGraphNodes from './utils/autoLayoutingGraphNodes';
import transformWorkflowsToGraphEntities from './utils/transformWorkflowsToGraphEntities';
import validateConnection from './utils/validateConnection';

const nodeTypes: NodeTypes = {
  [WORKFLOW_NODE_TYPE]: WorkflowNode,
  [PLACEHOLDER_NODE_TYPE]: PlaceholderNode,
  [GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE]: GeneratedWorkflowsPlaceholderNode,
  [TRIGGER_NODE_TYPE]: TriggerNode,
  [ADD_WORKFLOW_NODE_TYPE]: AddWorkflowNode,
};

const edgeTypes: EdgeTypes = {
  [GRAPH_EDGE_TYPE]: GraphEdge,
};

const GraphPipelineCanvas = (props: ReactFlowProps) => {
  const workflows = usePipelineWorkflows();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);
  const selectedStepIndices = usePipelinesPageStore((s) => s.selectedStepIndices);
  const selectionParent = usePipelinesPageStore((s) => s.selectionParent);
  const isAddingStep = usePipelinesPageStore((s) => s.openedDialogType === PipelinesPageDialogType.STEP_SELECTOR);
  const isStepSelected = !isAddingStep && hasSelectedSteps({ selectedStepIndices, selectionParent });
  // Behind an open tool panel the canvas stays mounted but out of reach: no key deletes anything on it.
  const isBehindToolPanel = useIsBehindToolPanel();
  // A Pipeline's canvas starts with no Step selected (a selection from the previous Pipeline would point at Steps
  // that aren't on screen).
  useEffect(() => {
    usePipelinesPageStore.setState({ selectedStepIndices: [] });
  }, []);
  // Backspace deletes the selected Steps. While a Step is selected, React Flow's own Backspace (which deletes
  // the selected Workflow node from the Pipeline) is off, so the Step is what goes.
  useDeleteSelectedStepsOnKey({
    selectedStepIndices,
    selectionParent,
    isEnabled: !isAddingStep,
    onDeleted: () => {
      closeDialog();
      usePipelinesPageStore.setState({ selectedStepIndices: [] });
    },
  });
  const { selectedPipeline } = usePipelineSelector();
  const [prevWorkflows, setPrevWorkflows] = useState(workflows);
  const initial = addCanvasControls(workflows, transformWorkflowsToGraphEntities(workflows));
  const { updateEdgeData, getNode, getZoom, setCenter } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();
  const flowStore = useStoreApi();
  // The node whose drawer is open: a Workflow's own, or one of its chained Workflows'.
  const focusedNodeId = usePipelinesPageStore((s) =>
    s.openedDialogType === PipelinesPageDialogType.WORKFLOW_CONFIG ? s.parentWorkflowId || s.workflowId : undefined,
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [nodes, setNodes] = useNodesState(autoLayoutingGraphNodes(workflows, initial.nodes));

  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => {
        if (workflows.some((workflow) => workflow.id === edge.target)) {
          PipelineService.removePipelineWorkflowDependency(selectedPipeline, edge.target, edge.source);
        }
      });
    },
    [selectedPipeline, workflows],
  );

  const handleNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => {
        if (isWorkflowNode(node)) {
          PipelineService.removeWorkflowFromPipeline(selectedPipeline, node.id);
        }
      });
    },
    [selectedPipeline],
  );

  const handleConnect: OnConnect = useCallback(
    (params) => PipelineService.addPipelineWorkflowDependency(selectedPipeline, params.target, params.source),
    [selectedPipeline],
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

  // Clicking a Workflow node opens its drawer, as its settings button does. Clicks on what's inside
  // the card (steps, its own buttons, menus) keep doing their own thing.
  const handleNodeClick: NodeMouseHandler<GraphPipelineNodeType> = useCallback(
    (event, node) => {
      const isOnControl = (event.target as Element).closest(
        'button, a, input, textarea, select, [role="button"], [role="menuitem"], [role="checkbox"]',
      );
      if (!isWorkflowNode(node) || isOnControl || focusedNodeId === node.id) {
        return;
      }
      // A `uses:` entry is the Pipeline's own name for another Workflow: its settings are that Workflow's. An
      // entry may also point at a Workflow that isn't defined, which has no settings to open.
      const workflowId = ('uses' in node.data && node.data.uses) || node.id;
      if (!isWorkflowDefined(workflowId)) {
        return;
      }
      openDialog({
        type: PipelinesPageDialogType.WORKFLOW_CONFIG,
        pipelineId: selectedPipeline,
        workflowId,
      })();
    },
    [focusedNodeId, openDialog, selectedPipeline],
  );

  // A clicked node opens too, if it fits the canvas at the current zoom; one with too many Steps stays
  // closed rather than spilling off-screen. It closes again when the focus moves on or the drawer closes.
  useEffect(() => {
    const node = focusedNodeId ? getNode(focusedNodeId) : undefined;
    let nodeId: string | undefined;
    if (node && isWorkflowNode(node)) {
      const workflowId = node.data.uses || node.id;
      const available = flowStore.getState().height / getZoom() - 2 * CANVAS_PADDING;
      nodeId = estimateExpandedHeight(getBitriseYml(), workflowId) <= available ? node.id : undefined;
    }
    useAutoExpandedNode.setState({ nodeId });
  }, [focusedNodeId, flowStore, getNode, getZoom]);

  useEffect(() => () => useAutoExpandedNode.setState({ nodeId: undefined }), []);

  // Whenever a Workflow's drawer opens, glide its node to the middle of the canvas the drawer leaves
  // visible. It moves with the drawer's 0.2s slide-in, so the two read as one motion. While the node
  // opens and the layout settles, the glide follows it to where it ends up.
  const focusedNode = nodes.find((n) => n.id === focusedNodeId);
  const focusedY = focusedNode?.position.y;
  const focusedHeight = focusedNode?.measured?.height ?? focusedNode?.height;
  const focusedAt = useRef(0);
  useEffect(() => {
    focusedAt.current = Date.now();
  }, [focusedNodeId]);
  useEffect(() => {
    const node = focusedNodeId ? getNode(focusedNodeId) : undefined;
    if (!node || Date.now() - focusedAt.current > 800) {
      return;
    }
    const zoom = getZoom();
    const width = node.measured?.width ?? WORKFLOW_NODE_WIDTH;
    const fullHeight = node.measured?.height ?? WORKFLOW_NODE_HEIGHT;
    // A node that fits is centred whole; a taller one on its upper part, so its header stays in view.
    const fits = fullHeight <= flowStore.getState().height / zoom - 2 * CANVAS_PADDING;
    const height = fits ? fullHeight : Math.min(fullHeight, 240);
    setCenter(node.position.x + width / 2 + floatingDrawerCoveredWidth() / 2 / zoom, node.position.y + height / 2, {
      zoom,
      duration: 250,
    });
  }, [focusedNodeId, focusedY, focusedHeight, flowStore, getNode, getZoom, setCenter]);

  // Update nodes and edges when workflows change
  useEffect(() => {
    if (!isEqual(workflows, prevWorkflows)) {
      const entities = addCanvasControls(workflows, transformWorkflowsToGraphEntities(workflows));

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
        panOnScroll
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        onEdgeMouseMove={handleEdgeMouseEnter}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        connectionLineComponent={ConnectionGraphEdge}
        deleteKeyCode={isStepSelected || isBehindToolPanel ? null : undefined}
        isValidConnection={validateConnection(nodes, edges)}
        {...props}
      />
      {workflows.length === 0 && (
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
