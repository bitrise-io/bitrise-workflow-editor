import { useEventListener } from 'usehooks-ts';

import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import StepService from '@/core/services/StepService';
import { useIsReadOnlyView } from '@/hooks/useTree';

type Options = {
  selectedStepIndices: number[];
  selectionParent?: SelectionParent;
  // Off while the selection means something else, e.g. the spot a Step is being added at.
  isEnabled: boolean;
  // The selected Steps are gone: clear the selection and close their drawer.
  onDeleted: VoidFunction;
};

// Typing in a field (a Step input, a search, the YAML editor) keeps Backspace for the text.
const isTypingTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"], .monaco-editor',
    ),
  );

export const hasSelectedSteps = ({
  selectedStepIndices,
  selectionParent,
}: Pick<Options, 'selectedStepIndices' | 'selectionParent'>) =>
  Boolean(selectionParent?.id) && selectedStepIndices.length > 0;

// Backspace (or Delete) removes the selected Steps from the Workflow or Step bundle that holds them.
export default function useDeleteSelectedStepsOnKey({
  selectedStepIndices,
  selectionParent,
  isEnabled,
  onDeleted,
}: Options) {
  const isReadOnlyView = useIsReadOnlyView();

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') {
      return;
    }
    if (
      !isEnabled ||
      isReadOnlyView ||
      !selectionParent ||
      !hasSelectedSteps({ selectedStepIndices, selectionParent })
    ) {
      return;
    }
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
      return;
    }
    event.preventDefault();
    StepService.deleteStep(
      selectionParent.type === 'stepBundle' ? 'step_bundles' : 'workflows',
      selectionParent.id,
      selectedStepIndices,
    );
    onDeleted();
  });
}
