import { PipelineWorkflow } from '@/core/models/Workflow';

import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';
import createGraphPipelineEdge from './createGraphPipelineEdge';
import createWorkflowNode from './createWorkflowNode';

function transformWorkflowsToGraphEntities(workflows: PipelineWorkflow[]) {
  const nodes: GraphPipelineNodeType[] = [];
  const edges: GraphPipelineEdgeType[] = [];

  workflows.forEach((workflow) => {
    nodes.push(createWorkflowNode(workflow));

    workflow.dependsOn?.forEach((source) => {
      edges.push(createGraphPipelineEdge(source, workflow.id));
    });
  });

  return { nodes, edges };
}

export default transformWorkflowsToGraphEntities;
