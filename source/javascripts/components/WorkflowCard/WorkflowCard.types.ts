import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';

export type WorkflowCardCallbacks = {
  onStepMove?: (workflowId: string, stepIndex: number, to: number) => void;
  onStepSelect?: (workflowId: string, stepIndex: number) => void;
  onChainedWorkflowsUpdate?: (workflowId: string, placement: Placement, chainedWorkflowIds: string[]) => void;
  onAddStepClick?: (workflowId: string, stepIndex: number) => void;
  onEditWorkflowClick?: (workflowId: string) => void;
  onAddChainedWorkflowClick?: (workflowId: string) => void;
  onDeleteChainedWorkflowClick?: (chainedWorkflowIndex: number, parentWorkflowId: string, placement: Placement) => void;
};

export type SortableWorkflowItem = {
  id: string;
  index: number;
  uniqueId: string;
  placement: Placement;
  parentWorkflowId: string;
};
