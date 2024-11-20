import { PipelineWorkflow } from '@/core/models/Workflow';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';
import createGraphPipelineEdge from './createGraphPipelineEdge';
import createGraphPipelineNode from './createGraphPipelineNode';

function transformWorkflowsToGraphEntities(workflows: PipelineWorkflow[], actionable: boolean) {
  const nodes: GraphPipelineNodeType[] = [];
  const edges: GraphPipelineEdgeType[] = [];

  workflows.forEach((workflow) => {
    nodes.push(createGraphPipelineNode(workflow, actionable));

    workflow.dependsOn.forEach((source) => {
      edges.push(createGraphPipelineEdge(source, workflow.id, actionable));
    });
  });

  return { nodes, edges };
}

export default transformWorkflowsToGraphEntities;
