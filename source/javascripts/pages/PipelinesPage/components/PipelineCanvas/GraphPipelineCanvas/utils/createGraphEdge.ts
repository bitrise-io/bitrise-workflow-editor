import { GRAPH_EDGE_TYPE } from '../GraphPipelineCanvas.const';

export default function createGraphEdge(sourceWorkflowId: string, targetWorkflowId: string) {
  return {
    id: `${sourceWorkflowId}->${targetWorkflowId}`,
    deletable: true,
    focusable: false,
    selectable: true,
    reconnectable: false,
    type: GRAPH_EDGE_TYPE,
    source: sourceWorkflowId,
    target: targetWorkflowId,
  };
}
