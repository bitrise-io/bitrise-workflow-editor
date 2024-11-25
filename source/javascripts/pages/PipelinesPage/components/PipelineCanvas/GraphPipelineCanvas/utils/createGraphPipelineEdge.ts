import { GRAPH_EDGE_TYPE } from '../GraphPipelineCanvas.const';
import { GraphPipelineEdgeType } from '../GraphPipelineCanvas.types';

function createGraphPipelineEdge(sourceWorkflowId: string, targetWorkflowId: string, actionable: boolean) {
  return {
    id: `${sourceWorkflowId}->${targetWorkflowId}`,
    deletable: actionable,
    focusable: false,
    selectable: true,
    reconnectable: actionable,
    type: GRAPH_EDGE_TYPE,
    source: sourceWorkflowId,
    target: targetWorkflowId,
  } satisfies GraphPipelineEdgeType;
}

export default createGraphPipelineEdge;
