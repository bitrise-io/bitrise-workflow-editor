import { Node } from '@xyflow/react';
import { PipelineWorkflow } from '@/core/models/Workflow';
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_TYPE, WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { WorkflowNodeDataType } from '../components/WorkflowNode/WorkflowNode';

export default function createNodeFromPipelineWorkflow(
  workflow: PipelineWorkflow,
  pipelineId?: string,
  actionable: boolean = false,
): Node<WorkflowNodeDataType> {
  return {
    id: workflow.id,
    deletable: actionable,
    draggable: false,
    focusable: false,
    selectable: true,
    connectable: actionable,
    type: WORKFLOW_NODE_TYPE,
    width: WORKFLOW_NODE_WIDTH,
    height: WORKFLOW_NODE_HEIGHT,
    position: { x: -9999, y: -9999 },
    data: { ...workflow, pipelineId },
  };
}
