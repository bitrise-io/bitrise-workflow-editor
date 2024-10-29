import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import { Edge, Node } from 'reactflow';
import {
  CANVAS_PADDING,
  TOOLBAR_CONTAINER_HEIGHT,
  WORKFLOW_NODE_GAP_X,
  WORKFLOW_NODE_GAP_Y,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';
import usePipelineWorkflows from './usePipelineWorkflows';

const useGraphPipeline = () => {
  const workflows = usePipelineWorkflows();

  return useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      align: 'UL',
      rankdir: 'LR',
      marginx: CANVAS_PADDING - 160,
      marginy: CANVAS_PADDING + TOOLBAR_CONTAINER_HEIGHT,
      ranksep: WORKFLOW_NODE_GAP_X,
      nodesep: WORKFLOW_NODE_GAP_Y,
      edgesep: WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP_Y,
    });

    workflows.forEach((workflow) => {
      graph.setNode(workflow.id, { width: WORKFLOW_NODE_WIDTH, height: WORKFLOW_NODE_HEIGHT });
      workflow.dependsOn.forEach((source) => graph.setEdge(source, workflow.id));
    });

    dagre.layout(graph);

    workflows.forEach((workflow, i) => {
      const { x, y } = graph.node(workflow.id);

      nodes.push({
        id: workflow.id,
        data: workflow,
        type: 'workflow',
        deletable: false,
        draggable: false,
        focusable: false,
        selectable: true,
        connectable: false,
        position: { x, y },
        zIndex: workflows.length - i,
        width: WORKFLOW_NODE_WIDTH,
        height: WORKFLOW_NODE_HEIGHT,
      });

      workflow.dependsOn.forEach((source) => {
        edges.push({
          id: `${source}->${workflow.id}`,
          source,
          target: workflow.id,
          type: 'graph-edge',
          deletable: false,
          focusable: false,
          reconnectable: false,
        });
      });
    });

    return { nodes, edges };
  }, [workflows]);
};

export default useGraphPipeline;
