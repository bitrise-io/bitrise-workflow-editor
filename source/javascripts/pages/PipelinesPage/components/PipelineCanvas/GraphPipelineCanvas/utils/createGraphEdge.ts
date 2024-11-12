import { Edge } from '@xyflow/react';
import { GRAPH_EDGE_TYPE } from '../GraphPipelineCanvas.const';

export default function createGraphEdge(
  sourceWorkflowId: string,
  targetWorkflowId: string,
  actionable: boolean = false,
): Edge {
  return {
    id: `${sourceWorkflowId}->${targetWorkflowId}`,
    deletable: actionable,
    focusable: false,
    selectable: true,
    reconnectable: actionable,
    type: GRAPH_EDGE_TYPE,
    source: sourceWorkflowId,
    target: targetWorkflowId,
  };
}
