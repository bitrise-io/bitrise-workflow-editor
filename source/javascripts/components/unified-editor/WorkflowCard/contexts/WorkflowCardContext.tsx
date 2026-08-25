import { pick } from 'es-toolkit';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import {
  SelectedWorkflow,
  SelectionParent,
  StepActions,
  WorkflowActions,
} from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { useIsReadOnlyView } from '@/hooks/useTree';

type State = {
  selectedStepIndices?: number[];
  selectionParent?: SelectionParent;
  selectedWorkflow?: SelectedWorkflow;
};
type Actions = StepActions & WorkflowActions;
type ContextState = State & Actions;

const WorkflowCardContext = createContext<ContextState | undefined>(undefined);

const WorkflowCardContextProvider = ({
  children,
  selectedStepIndices = [],
  selectionParent,
  selectedWorkflow,
  ...methods
}: PropsWithChildren<ContextState>) => {
  const state = useMemo(
    () => ({
      ...methods,
      selectedStepIndices,
      selectionParent,
      selectedWorkflow,
    }),
    [methods, selectedStepIndices, selectionParent, selectedWorkflow],
  );

  return <WorkflowCardContext.Provider value={state}>{children}</WorkflowCardContext.Provider>;
};

function useSelection() {
  const state = useContext(WorkflowCardContext);

  if (!state) {
    throw new Error('useSelection must be used within a WorkflowCardContextProvider');
  }

  return useMemo(
    () => ({
      selectedStepIndices: state.selectedStepIndices,
      // Whether this card is the one whose config is currently open. Deliberately independent of
      // `isSelected` below, which is about step selection and needs a step index.
      isWorkflowSelected: ({ workflowId, parentWorkflowId }: { workflowId: string; parentWorkflowId?: string }) => {
        if (!state.selectedWorkflow) {
          return false;
        }

        return (
          state.selectedWorkflow.workflowId === workflowId &&
          (state.selectedWorkflow.parentWorkflowId ?? '') === (parentWorkflowId ?? '')
        );
      },
      isSelected: ({
        stepBundleId,
        stepIndex = -1,
        workflowId,
      }: {
        stepBundleId?: string;
        stepIndex?: number;
        workflowId?: string;
      }) => {
        const type: SelectionParent['type'] = stepBundleId ? 'stepBundle' : 'workflow';
        const isWorkflowSelected =
          typeof workflowId === 'string' && type === 'workflow' && state.selectionParent?.id === workflowId;
        const isStepBundleSelected = type === 'stepBundle' && state.selectionParent?.id === stepBundleId;
        const isStepIndexSelected = state.selectedStepIndices?.includes(stepIndex);

        return (isWorkflowSelected || isStepBundleSelected) && isStepIndexSelected;
      },
    }),
    [state],
  );
}

function useWorkflowActions(): WorkflowActions {
  const methods = useContext(WorkflowCardContext);
  const isReadOnlyView = useIsReadOnlyView();

  if (!methods) {
    throw new Error('useWorkflowActions must be used within a WorkflowCardContextProvider');
  }

  return useMemo(() => {
    // Cards render mutating controls based on callback presence, so dropping the callbacks in a
    // read-only view removes those controls everywhere; only the inspection actions are kept.
    if (isReadOnlyView) {
      return pick(methods, ['onSelectWorkflow', 'onEditWorkflow', 'onEditChainedWorkflow']);
    }

    return pick(methods, [
      'onCreateWorkflow',
      'onSelectWorkflow',
      'onEditWorkflow',
      'onEditChainedWorkflow',
      'onChainWorkflow',
      'onChainChainedWorkflow',
      'onChainedWorkflowsUpdate',
      'onRemoveWorkflow',
      'onRemoveChainedWorkflow',
    ]);
  }, [methods, isReadOnlyView]);
}

const useStepActions = (): StepActions => {
  const methods = useContext(WorkflowCardContext);
  const isReadOnlyView = useIsReadOnlyView();

  if (!methods) {
    throw new Error('useStepActions must be used within a WorkflowCardContextProvider');
  }

  return useMemo(() => {
    if (isReadOnlyView) {
      return pick(methods, ['onSelectStep']);
    }

    return pick(methods, [
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
    ]);
  }, [methods, isReadOnlyView]);
};

export { useSelection, useStepActions, useWorkflowActions, WorkflowCardContextProvider };
