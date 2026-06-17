import { pick } from 'es-toolkit';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import {
  SelectionParent,
  StepActions,
  WorkflowActions,
} from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { useIsReadOnlyView } from '@/hooks/useTree';

type State = {
  selectedStepIndices?: number[];
  selectionParent?: SelectionParent;
};
type Actions = StepActions & WorkflowActions;
type ContextState = State & Actions;

const WorkflowCardContext = createContext<ContextState | undefined>(undefined);

const WorkflowCardContextProvider = ({
  children,
  selectedStepIndices = [],
  selectionParent,
  ...methods
}: PropsWithChildren<ContextState>) => {
  const state = useMemo(
    () => ({
      ...methods,
      selectedStepIndices,
      selectionParent,
    }),
    [methods, selectedStepIndices, selectionParent],
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
      return pick(methods, ['onEditWorkflow', 'onEditChainedWorkflow']);
    }

    return pick(methods, [
      'onCreateWorkflow',
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
