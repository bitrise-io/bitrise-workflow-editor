import { Edge, Node } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';

export default function transformWorkflowsToNodesAndEdges(
  pipelineId: string,
  workflows: PipelineWorkflow[],
  position = { x: 0, y: 0 },
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  workflows.forEach((workflow) => {
    nodes.push({
      position,
      id: workflow.id,
      data: { ...workflow, pipelineId },
      type: 'workflow',
      deletable: true,
      draggable: false,
      focusable: false,
      selectable: true,
      connectable: false,
      width: WORKFLOW_NODE_WIDTH,
      height: WORKFLOW_NODE_HEIGHT,
    });

    workflow.dependsOn.forEach((source) => {
      edges.push({
        id: `${source}->${workflow.id}`,
        source,
        target: workflow.id,
        type: 'graph-edge',
        deletable: true,
        focusable: false,
        selectable: false,
        reconnectable: false,
      });
    });
  });

  return { nodes, edges };
}
