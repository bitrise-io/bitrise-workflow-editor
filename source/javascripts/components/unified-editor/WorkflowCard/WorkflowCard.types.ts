import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import { LibraryType } from '@/core/models/Step';

export type WorkflowActions = {
  onCreateWorkflow?: () => void;
  onEditWorkflow?: (workflowId: string) => void;
  onEditChainedWorkflow?: (workflowId: string, parentWorkflowId: string) => void;
  onChainWorkflow?: (workflowId: string) => void;
  onChainChainedWorkflow?: (workflowId: string) => void;
  onChainedWorkflowsUpdate?: (parentWorkflowId: string, placement: Placement, chainedWorkflows: string[]) => void;
  onRemoveWorkflow?: (workflowId: string) => void;
  onRemoveChainedWorkflow?: (
    parentWorkflowId: string,
    placement: Placement,
    workflowId: string,
    workflowIndex: number,
  ) => void;
};

export type StepActions = {
  onAddStep?: (workflowId: string, stepIndex: number) => void;
  onSelectStep?: (workflowId: string, stepIndex: number, libraryType: LibraryType) => void;
  onMoveStep?: (workflowId: string, stepIndex: number, targetIndex: number) => void;
  onUpgradeStep?: (workflowId: string, stepIndex: number, version: string) => void;
  onCloneStep?: (workflowId: string, stepIndex: number) => void;
  onDeleteStep?: (workflowId: string, stepIndex: number) => void;
};

export type SortableWorkflowItem = {
  id: string;
  index: number;
  uniqueId: string;
  placement: Placement;
  parentWorkflowId: string;
};

export type SortableStepItem = {
  uniqueId: string;
  stepIndex: number;
  workflowId?: string;
  stepBundleId?: string;
};
