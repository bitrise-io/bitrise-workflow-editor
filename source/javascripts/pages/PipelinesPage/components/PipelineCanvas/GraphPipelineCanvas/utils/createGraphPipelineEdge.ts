import { GRAPH_EDGE_TYPE } from '../GraphPipelineCanvas.const';
import { GraphPipelineEdgeType } from '../GraphPipelineCanvas.types';

function createGraphPipelineEdge(sourceWorkflowId: string, targetWorkflowId: string) {
  return {
    id: `${sourceWorkflowId}->${targetWorkflowId}`,
    deletable: true,
    focusable: false,
    selectable: true,
    reconnectable: true,
    type: GRAPH_EDGE_TYPE,
    source: sourceWorkflowId,
    target: targetWorkflowId,
  } satisfies GraphPipelineEdgeType;
}

export default createGraphPipelineEdge;
