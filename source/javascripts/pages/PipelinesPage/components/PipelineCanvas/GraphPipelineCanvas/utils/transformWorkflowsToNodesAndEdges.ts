import { Edge, Node } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import createGraphEdge from './createGraphEdge';
import createNodeFromPipelineWorkflow from './createNodeFromPipelineWorkflow';

export default function transformWorkflowsToNodesAndEdges(
  pipelineId: string,
  workflows: PipelineWorkflow[],
  isActionable: boolean,
): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  workflows.forEach((workflow) => {
    nodes.push(createNodeFromPipelineWorkflow(workflow, pipelineId, isActionable));

    workflow.dependsOn.forEach((source) => {
      edges.push(createGraphEdge(source, workflow.id, isActionable));
    });
  });

  return { nodes, edges };
}
