import dagre from '@dagrejs/dagre';
import { PipelineWorkflow } from '@/core/models/Workflow';
import {
  CANVAS_PADDING,
  TOOLBAR_CONTAINER_HEIGHT,
  WORKFLOW_NODE_GAP_X,
  WORKFLOW_NODE_GAP_Y,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';
import { GraphPipelineNodeType, isPlaceholderNode } from '../GraphPipelineCanvas.types';

function autoLayoutingGraphNodes(workflows: PipelineWorkflow[], nodes: GraphPipelineNodeType[]) {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  graph.setGraph({
    align: 'UL',
    rankdir: 'LR',
    marginx: CANVAS_PADDING,
    marginy: CANVAS_PADDING + TOOLBAR_CONTAINER_HEIGHT,
    ranksep: WORKFLOW_NODE_GAP_X,
    nodesep: WORKFLOW_NODE_GAP_Y,
    edgesep: WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP_Y,
  });

  nodes.forEach((node) => {
    if (isPlaceholderNode(node)) {
      graph.setNode(node.id, { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT });
      node.data.dependsOn.forEach((source) => graph.setEdge(source, node.id));
    } else {
      const workflow = workflows.find((w) => w.id === node.id);

      if (!workflow) {
        return;
      }

      graph.setNode(node.id, { width: WORKFLOW_NODE_WIDTH, height: node.height ?? WORKFLOW_NODE_HEIGHT });
      workflow.dependsOn.forEach((source) => graph.setEdge(source, node.id));
    }
  });

  dagre.layout(graph, { disableOptimalOrderHeuristic: true });

  return nodes.map((node) => {
    if (!isPlaceholderNode(node) && node.data.fixed) {
      return node;
    }

    const { x, y, width, height } = graph.node(node.id);
    return { ...node, position: { x: x - width / 2, y: y - height / 2 } };
  });
}

export default autoLayoutingGraphNodes;
