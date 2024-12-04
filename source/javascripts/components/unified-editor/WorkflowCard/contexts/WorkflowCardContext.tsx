import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { pick } from 'es-toolkit';
import { StepActions, WorkflowActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';

type State = {
  selectedWorkflowId: string;
  selectedStepIndex: number;
};
type Actions = StepActions & WorkflowActions;
type ContextState = State & Actions;

const WorkflowCardContext = createContext<ContextState | undefined>(undefined);

const WorkflowCardContextProvider = ({
  children,
  selectedWorkflowId,
  selectedStepIndex,
  ...methods
}: PropsWithChildren<ContextState>) => {
  const state = useMemo(
    () => ({
      ...methods,
      selectedWorkflowId,
      selectedStepIndex,
    }),
    [methods, selectedWorkflowId, selectedStepIndex],
  );
  return <WorkflowCardContext.Provider value={state}>{children}</WorkflowCardContext.Provider>;
};

function useSelection() {
  const state = useContext(WorkflowCardContext);

  if (!state) {
    throw new Error('useSelection must be used within a WorkflowCardContextProvider');
  }

  const selection = useMemo(() => pick(state, ['selectedWorkflowId', 'selectedStepIndex']), [state]);
  return useMemo(
    () => ({
      ...selection,
      isSelected: (workflowId: string, stepIndex: number = -1) => {
        return selection.selectedWorkflowId === workflowId && selection.selectedStepIndex === stepIndex;
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
    () => pick(methods, ['onAddStep', 'onSelectStep', 'onMoveStep', 'onUpgradeStep', 'onCloneStep', 'onDeleteStep']),
    [methods],
  );
};

export { WorkflowCardContextProvider, useWorkflowActions, useStepActions, useSelection };
