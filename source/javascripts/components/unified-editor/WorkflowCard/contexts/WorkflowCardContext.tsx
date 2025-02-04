import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { pick } from 'es-toolkit';
import { StepActions, WorkflowActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

type State = {
  selectedWorkflowId?: string;
  selectedStepBundleId?: string;
  selectedStepIndices: number[];
};
type Actions = StepActions & WorkflowActions;
type ContextState = State & Actions;

const WorkflowCardContext = createContext<ContextState | undefined>(undefined);

const WorkflowCardContextProvider = ({
  children,
  selectedWorkflowId = '',
  selectedStepBundleId = '',
  selectedStepIndices = [],
  ...methods
}: PropsWithChildren<ContextState>) => {
  const state = useMemo(
    () => ({
      ...methods,
      selectedWorkflowId,
      selectedStepBundleId,
      selectedStepIndices,
    }),
    [methods, selectedWorkflowId, selectedStepBundleId, selectedStepIndices],
  );

  return <WorkflowCardContext.Provider value={state}>{children}</WorkflowCardContext.Provider>;
};

function useSelection() {
  const state = useContext(WorkflowCardContext);

  if (!state) {
    throw new Error('useSelection must be used within a WorkflowCardContextProvider');
  }

  const selection = useMemo(
    () => pick(state, ['selectedWorkflowId', 'selectedStepBundleId', 'selectedStepIndices']),
    [state],
  );
  return useMemo(
    () => ({
      ...selection,
      isSelected: (workflowId?: string, stepIndex: number = -1, stepBundleId: string = '') => {
        return (
          ((typeof workflowId === 'string' && selection.selectedWorkflowId === workflowId) ||
            selection.selectedStepBundleId === stepBundleId) &&
          selection.selectedStepIndices.includes(stepIndex)
        );
      },
    }),
    [selection],
  );
}

function useWorkflowActions(): WorkflowActions {
  const methods = useContext(WorkflowCardContext);

  if (!methods) {
    throw new Error('useWorkflowActions must be used within a WorkflowCardContextProvider');
  }

  return useMemo(
    () =>
      pick(methods, [
        'onCreateWorkflow',
        'onEditWorkflow',
        'onEditChainedWorkflow',
        'onChainWorkflow',
        'onChainChainedWorkflow',
        'onChainedWorkflowsUpdate',
        'onRemoveWorkflow',
        'onRemoveChainedWorkflow',
      ]),
    [methods],
  );
}

const useStepActions = (): StepActions => {
  const methods = useContext(WorkflowCardContext);

  if (!methods) {
    throw new Error('useStepActions must be used within a WorkflowCardContextProvider');
  }

  return useMemo(
    () =>
      pick(methods, [
        'onAddStep',
        'onSelectStep',
        'onMoveStep',
        'onUpgradeStep',
        'onCloneStep',
        'onDeleteStep',
        'onAddStepToStepBundle',
        'onCloneStepInStepBundle',
        'onDeleteStepInStepBundle',
        'onGroupStepsToStepBundle',
        'onMoveStepInStepBundle',
        'onUpgradeStepInStepBundle',
      ]),
    [methods],
  );
};

export { WorkflowCardContextProvider, useWorkflowActions, useStepActions, useSelection };
