import { PLACEHOLDER_NODE_ID, PLACEHOLDER_NODE_TYPE } from '../GraphPipelineCanvas.const';
import { PlaceholderNodeType } from '../GraphPipelineCanvas.types';

function createPlaceholderNode(dependsOn: string) {
  return {
    id: PLACEHOLDER_NODE_ID,
    type: PLACEHOLDER_NODE_TYPE,
    data: { dependsOn: [dependsOn] },
    position: { x: -9999, y: -9999 },
  } satisfies PlaceholderNodeType;
}

export default createPlaceholderNode;
