import { Node } from '@xyflow/react';
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

export default function autoLayoutingGraphNodes(nodes: Node[]) {
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

  (nodes as Array<Node<PipelineWorkflow>>).forEach((node) => {
    graph.setNode(node.data.id, {
      width: WORKFLOW_NODE_WIDTH,
      height: node.height ?? WORKFLOW_NODE_HEIGHT,
    });
    node.data.dependsOn.forEach((source) => graph.setEdge(source, node.id));
  });

  dagre.layout(graph, { disableOptimalOrderHeuristic: true });

  return nodes.map((n) => {
    const { x, y, width, height } = graph.node(n.id);

    if (n.data.fixed) {
      return n;
    }

    return {
      ...n,
      position: {
        x: x - width / 2,
        y: y - height / 2,
      },
    };
  });
}
