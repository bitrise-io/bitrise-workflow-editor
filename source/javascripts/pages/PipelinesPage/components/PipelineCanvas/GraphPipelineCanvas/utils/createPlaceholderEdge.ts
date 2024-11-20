import { Edge } from '@xyflow/react';
import { GRAPH_EDGE_TYPE, PLACEHOLDER_NODE_ID } from '../GraphPipelineCanvas.const';

function createPlaceholderEdge(source: string) {
  return {
    source,
    animated: true,
    type: GRAPH_EDGE_TYPE,
    target: PLACEHOLDER_NODE_ID,
    id: `${source}->${PLACEHOLDER_NODE_ID}`,
  } satisfies Edge;
}

export default createPlaceholderEdge;
