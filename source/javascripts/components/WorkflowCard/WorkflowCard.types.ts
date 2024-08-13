import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';

export type StepEditCallback = (workflowId: string, stepIndex: number) => void;
export type WorkflowEditCallback = (workflowId: string) => void;
export type MoveStepCallback = (workflowId: string, stepIndex: number, to: number) => void;
export type DeleteChainedWorkflowCallback = (
  chainedWorkflowIndex: number,
  parentWorkflowId: string,
  placement: Placement,
) => void;
export type MoveChainedWorkflowCallback = (
  workflowId: string,
  placement: Placement,
  chainedWorkflowIds: string[],
) => void;

export type WorkflowCardCallbacks = {
  onAddStep?: StepEditCallback;
  onMoveStep?: MoveStepCallback;
  onSelectStep?: StepEditCallback;
  onEditWorkflow?: WorkflowEditCallback;
  onChainWorkflow?: WorkflowEditCallback;
  onSetChainedWorkflows?: MoveChainedWorkflowCallback;
  onDeleteChainedWorkflow?: DeleteChainedWorkflowCallback;
};

export type SortableWorkflowItem = {
  id: string;
  index: number;
  uniqueId: string;
  placement: Placement;
  parentWorkflowId: string;
};
