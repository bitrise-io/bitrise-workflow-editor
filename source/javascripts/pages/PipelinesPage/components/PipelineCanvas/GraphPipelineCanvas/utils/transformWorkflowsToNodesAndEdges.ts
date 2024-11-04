import { Edge, Node } from 'reactflow';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';

export default function transformWorkflowsToNodesAndEdges(workflows: PipelineWorkflow[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  workflows.forEach((workflow) => {
    nodes.push({
      id: workflow.id,
      data: workflow,
      type: 'workflow',
      deletable: false,
      draggable: false,
      focusable: false,
      selectable: true,
      connectable: false,
      position: { x: 0, y: 0 },
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
}
