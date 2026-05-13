import {
  DEFAULT_WORKFLOW_NODE_ZINDEX,
  GENERATED_WORKFLOWS_PLACEHOLDER_NODE_ID_PREFIX,
  GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';
import { GeneratedWorkflowsPlaceholderNodeType } from '../GraphPipelineCanvas.types';

export function generatedWorkflowsPlaceholderNodeId(generatorWorkflowId: string): string {
  return `${GENERATED_WORKFLOWS_PLACEHOLDER_NODE_ID_PREFIX}${generatorWorkflowId}`;
}

function createGeneratedWorkflowsPlaceholderNode(generatorWorkflowId: string) {
  return {
    id: generatedWorkflowsPlaceholderNodeId(generatorWorkflowId),
    type: GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE,
    data: { generatorId: generatorWorkflowId },
    deletable: false,
    draggable: false,
    focusable: false,
    selectable: false,
    connectable: false,
    width: WORKFLOW_NODE_WIDTH,
    height: WORKFLOW_NODE_HEIGHT,
    position: { x: -9999, y: -9999 },
    zIndex: DEFAULT_WORKFLOW_NODE_ZINDEX,
  } satisfies GeneratedWorkflowsPlaceholderNodeType;
}

export default createGeneratedWorkflowsPlaceholderNode;
