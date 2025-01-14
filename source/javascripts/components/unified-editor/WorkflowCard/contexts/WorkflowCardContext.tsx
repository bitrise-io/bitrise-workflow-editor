import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pick } from 'es-toolkit';
import { StepActions, WorkflowActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';

type State = {
  selectedWorkflowId: string;
  selectedStepIndices: number[];
  setSelectedStepIndices: (selectedStepIndices: number[]) => void;
};
type Actions = StepActions & WorkflowActions;
type ContextState = Partial<State> & Actions;

const WorkflowCardContext = createContext<ContextState | undefined>(undefined);

const WorkflowCardContextProvider = ({
  children,
  selectedWorkflowId = '',
  selectedStepIndices = [],
  ...methods
}: PropsWithChildren<ContextState>) => {
  const [indices, setIndices] = useState<number[]>([]);

  useEffect(() => {
    setIndices(selectedStepIndices.filter((index) => index >= 0));
  }, [selectedStepIndices]);

  const onSelectStep = useCallback<
    (props: { stepIndex: number; type: LibraryType; stepBundleId?: string; wfId?: string }) => void
  >(
    ({ wfId, stepIndex, stepBundleId, type }) => {
      if (indices.length === 0) {
        setIndices([stepIndex]);
        methods.onSelectStep?.({ wfId, stepIndex, stepBundleId, type });
      } else {
        setIndices((prev) => [...prev, stepIndex]);
      }
    },
    [indices.length, methods],
  );

  const state = useMemo(
    () => ({
      ...methods,
      onSelectStep,
      selectedWorkflowId,
      selectedStepIndices: indices,
    }),
    [methods, onSelectStep, selectedWorkflowId, indices],
  );

  return <WorkflowCardContext.Provider value={state}>{children}</WorkflowCardContext.Provider>;
};

function useSelection() {
  const state = useContext(WorkflowCardContext);

  if (!state) {
    throw new Error('useSelection must be used within a WorkflowCardContextProvider');
  }

  const selection = useMemo(() => pick(state, ['selectedWorkflowId', 'selectedStepIndices']), [state]);
  return useMemo(
    () => ({
      ...selection,
      isSelected: (workflowId: string, stepIndex: number = -1) => {
        return selection.selectedWorkflowId === workflowId && selection.selectedStepIndices?.includes(stepIndex);
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
        'onMoveStepInStepBundle',
        'onUpgradeStepInStepBundle',
      ]),
    [methods],
  );
};

export { WorkflowCardContextProvider, useWorkflowActions, useStepActions, useSelection };
