import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import { BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { LibraryType } from '@/core/models/Step';

export type WorkflowSelectionRef = {
  setSelection: (workflowId?: string, stepIndex?: number) => void;
  resetSelection: VoidFunction;
};

export type WorkflowActions = {
  onCreateWorkflow?: () => void;
  onEditWorkflow?: (workflowId: string) => void;
  onEditChainedWorkflow?: (workflowId: string) => void;
  onChainWorkflow?: (workflowId: string) => void;
  onChainChainedWorkflow?: (workflowId: string) => void;
  onRemoveWorkflow?: (workflowId: string) => void;
  onRemoveChainedWorkflow?: BitriseYmlStoreState['removeChainedWorkflow'];
  onChainedWorkflowsUpdate?: BitriseYmlStoreState['setChainedWorkflows'];
};

export type StepActions = {
  onAddStep?: (workflowId: string, stepIndex: number) => void;
  onSelectStep?: (workflowId: string, stepIndex: number, libraryType: LibraryType) => void;
  onMoveStep?: BitriseYmlStoreState['moveStep'];
  onUpgradeStep?: BitriseYmlStoreState['changeStepVersion'];
  onCloneStep?: BitriseYmlStoreState['cloneStep'];
  onDeleteStep?: BitriseYmlStoreState['deleteStep'];
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
  workflowId: string;
};
