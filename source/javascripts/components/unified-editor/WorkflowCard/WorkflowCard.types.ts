import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import { BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import { LibraryType } from '@/core/models/Step';

export type WorkflowActions = {
  onCreateWorkflow?: () => void;
  onEditWorkflowClick?: (workflowId: string) => void;
  onAddChainedWorkflowClick?: (workflowId: string) => void;
  onChainedWorkflowsUpdate?: BitriseYmlStoreState['setChainedWorkflows'];
  onDeleteChainedWorkflowClick?: BitriseYmlStoreState['deleteChainedWorkflow'];
};

export type StepActions = {
  onAddStepClick?: (workflowId: string, stepIndex: number) => void;
  onStepSelect?: (workflowId: string, stepIndex: number, libraryType: LibraryType) => void;
  onStepMove?: BitriseYmlStoreState['moveStep'];
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

export const EMPTY_ACTIONS = {};
