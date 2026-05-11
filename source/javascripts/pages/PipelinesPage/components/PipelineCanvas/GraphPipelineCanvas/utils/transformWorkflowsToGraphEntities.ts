import { GraphPipelineEdgeType, GraphPipelineNodeType, PipelineCanvasWorkflow } from '../GraphPipelineCanvas.types';
import createGeneratedWorkflowsPlaceholderNode, {
  generatedWorkflowsPlaceholderNodeId,
} from './createGeneratedWorkflowsPlaceholderNode';
import createGraphPipelineEdge from './createGraphPipelineEdge';
import createWorkflowNode from './createWorkflowNode';

function transformWorkflowsToGraphEntities(workflows: PipelineCanvasWorkflow[]) {
  const nodes: GraphPipelineNodeType[] = [];
  const edges: GraphPipelineEdgeType[] = [];

  workflows.forEach((workflow) => {
    nodes.push(createWorkflowNode(workflow));

    workflow.dependsOn?.forEach((source) => {
      edges.push(createGraphPipelineEdge(source, workflow.id));
    });

    if (workflow.isGenerator) {
      nodes.push(createGeneratedWorkflowsPlaceholderNode(workflow.id));
      edges.push({
        ...createGraphPipelineEdge(workflow.id, generatedWorkflowsPlaceholderNodeId(workflow.id)),
        animated: true,
        deletable: false,
        selectable: false,
        reconnectable: false,
      });
    }
  });

  return { nodes, edges };
}

export default transformWorkflowsToGraphEntities;
