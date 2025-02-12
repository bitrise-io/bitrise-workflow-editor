import { PipelineWorkflow } from '@/core/models/Workflow';
import {
  DEFAULT_WORKFLOW_NODE_ZINDEX,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_NODE_TYPE,
  WORKFLOW_NODE_WIDTH,
} from '../GraphPipelineCanvas.const';
import { GraphPipelineNodeType } from '../GraphPipelineCanvas.types';

function createWorkflowNode(workflow: PipelineWorkflow, actionable: boolean) {
  return {
    id: workflow.id,
    data: {
      uses: workflow.uses,
      parallel: workflow.parallel,
    },
    deletable: actionable,
    draggable: false,
    focusable: false,
    selectable: true,
    connectable: actionable,
    type: WORKFLOW_NODE_TYPE,
    width: WORKFLOW_NODE_WIDTH,
    height: WORKFLOW_NODE_HEIGHT,
    position: { x: -9999, y: -9999 },
    zIndex: DEFAULT_WORKFLOW_NODE_ZINDEX,
  } satisfies GraphPipelineNodeType;
}

export default createWorkflowNode;
