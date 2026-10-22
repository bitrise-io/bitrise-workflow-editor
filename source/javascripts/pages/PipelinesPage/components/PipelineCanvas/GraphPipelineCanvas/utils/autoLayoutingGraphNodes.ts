import dagre from '@dagrejs/dagre';

import { FLOATING_CONTROLS_HEIGHT } from '../../../Toolbar/Toolbar';
import {
  CANVAS_PADDING,
  TRIGGER_NODE_SIZE,
  WORKFLOW_NODE_GAP_X,
  WORKFLOW_NODE_GAP_Y,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';
import {
  GraphPipelineNodeType,
  isAddWorkflowNode,
  isGeneratedWorkflowsPlaceholderNode,
  isPlaceholderNode,
  isTriggerNode,
  isWorkflowNode,
  PipelineCanvasWorkflow,
} from '../GraphPipelineCanvas.types';

function autoLayoutingGraphNodes(workflows: PipelineCanvasWorkflow[], nodes: GraphPipelineNodeType[]) {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const hasTrigger = nodes.some(isTriggerNode);

  graph.setGraph({
    align: 'UL',
    rankdir: 'LR',
    // Room on the left for the trigger node, which sits ahead of the first column.
    marginx: CANVAS_PADDING + (hasTrigger ? TRIGGER_NODE_SIZE + WORKFLOW_NODE_GAP_X : 0),
    // Room on top for the floating Pipeline controls.
    marginy: CANVAS_PADDING + FLOATING_CONTROLS_HEIGHT,
    ranksep: WORKFLOW_NODE_GAP_X,
    nodesep: WORKFLOW_NODE_GAP_Y,
    edgesep: WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP_Y,
  });

  nodes.forEach((node) => {
    if (isTriggerNode(node) || isAddWorkflowNode(node)) {
      // Placed against the first column below, rather than ranked by dagre.
    } else if (isPlaceholderNode(node)) {
      graph.setNode(node.id, { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT });
      node.data.dependsOn.forEach((source) => graph.setEdge(source, node.id));
    } else if (isGeneratedWorkflowsPlaceholderNode(node)) {
      graph.setNode(node.id, { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT });
      graph.setEdge(node.data.generatorId, node.id);
    } else {
      const workflow = workflows.find((w) => w.id === node.id);

      if (!workflow) {
        return;
      }

      graph.setNode(node.id, { width: WORKFLOW_NODE_WIDTH, height: node.height ?? WORKFLOW_NODE_HEIGHT });
      workflow.dependsOn?.forEach((source) => graph.setEdge(source, node.id));
    }
  });

  dagre.layout(graph, { disableOptimalOrderHeuristic: true });

  const laidOut = nodes.map((node) => {
    if (isTriggerNode(node) || isAddWorkflowNode(node) || (isWorkflowNode(node) && node.data.fixed)) {
      return node;
    }

    const { x, y, width, height } = graph.node(node.id);
    return { ...node, position: { x: x - width / 2, y: y - height / 2 } };
  });

  // The first column: the Workflows that depend on nothing.
  const rootIds = new Set(workflows.filter((w) => !w.dependsOn?.length).map((w) => w.id));
  const roots = laidOut.filter((node) => isWorkflowNode(node) && rootIds.has(node.id));
  if (roots.length === 0) {
    return laidOut;
  }
  const columnX = Math.min(...roots.map((node) => node.position.x));
  const columnTop = Math.min(...roots.map((node) => node.position.y));
  const columnBottom = Math.max(
    ...roots.map((node) => node.position.y + (node.measured?.height ?? node.height ?? WORKFLOW_NODE_HEIGHT)),
  );

  return laidOut.map((node) => {
    if (isTriggerNode(node)) {
      // Level with the top Workflow's header, where its incoming handle is.
      return {
        ...node,
        position: { x: CANVAS_PADDING, y: columnTop + WORKFLOW_NODE_HEIGHT / 2 - TRIGGER_NODE_SIZE / 2 },
      };
    }
    if (isAddWorkflowNode(node)) {
      return { ...node, position: { x: columnX, y: columnBottom + WORKFLOW_NODE_GAP_Y } };
    }
    return node;
  });
}

export default autoLayoutingGraphNodes;
