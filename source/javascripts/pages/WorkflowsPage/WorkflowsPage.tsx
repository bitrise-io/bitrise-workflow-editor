import { Box } from '@chakra-ui/react/box';
import { useEffect } from 'react';

import { useIsFirstRunTourActive } from '@/components/FirstRunTour/FirstRunTour';
import { useIsBehindToolPanel } from '@/components/Navigation/ToolPanel';
import WorkflowEmptyState from '@/components/unified-editor/WorkflowEmptyState';
import useCloseDialogsOnFileSwitch, { FileSwitchDialogRefs } from '@/hooks/useCloseDialogsOnFileSwitch';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

import Drawers from './components/Drawers/Drawers';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from './WorkflowsPage.store';

const STEP_INDEX_DIALOGS = [
  WorkflowsPageDialogType.STEP_CONFIG,
  WorkflowsPageDialogType.WITH_GROUP,
  WorkflowsPageDialogType.STEP_BUNDLE,
];

function fileSwitchDialogRefs(): FileSwitchDialogRefs | null {
  const { openedDialogType, workflowId, parentWorkflowId, stepBundleId, parentStepBundleId, selectedStepIndices } =
    useWorkflowsPageStore.getState();

  if (openedDialogType === WorkflowsPageDialogType.NONE) {
    return null;
  }

  return {
    workflowIds: [workflowId, parentWorkflowId],
    stepBundleIds: [stepBundleId, parentStepBundleId],
    steps: STEP_INDEX_DIALOGS.includes(openedDialogType)
      ? {
          source: stepBundleId ? 'step_bundles' : 'workflows',
          sourceId: stepBundleId || workflowId,
          indices: selectedStepIndices,
        }
      : undefined,
  };
}

const WorkflowsPage = () => {
  const [selectedWorkflowId] = useSelectedWorkflow();
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);

  // The Workflow's settings live in a drawer now, so opening a Workflow opens it, as a panel would
  // have shown them.
  // Behind a tool panel the page stays on screen without its drawer; it opens once the panel closes. The same
  // goes while the first-run tour runs or is about to: the drawer opens when it ends.
  const isBehindToolPanel = useIsBehindToolPanel();
  const isTourActive = useIsFirstRunTourActive();
  useEffect(() => {
    if (isBehindToolPanel || isTourActive) {
      return;
    }
    if (selectedWorkflowId) {
      // A Step selected in the previous Workflow doesn't carry over (Backspace would delete it out of sight).
      openDialog({
        type: WorkflowsPageDialogType.WORKFLOW_CONFIG,
        workflowId: selectedWorkflowId,
        selectedStepIndices: [],
      })();
    } else {
      closeDialog();
    }
  }, [selectedWorkflowId, openDialog, closeDialog, isBehindToolPanel, isTourActive]);

  useCloseDialogsOnFileSwitch(fileSwitchDialogRefs, () => {
    const { closeDialog: close, setSelectedStepIndices } = useWorkflowsPageStore.getState();
    close();
    setSelectedStepIndices();
  });

  if (!selectedWorkflowId) {
    return (
      <Box height="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState
          onCreateWorkflow={openDialog({
            type: WorkflowsPageDialogType.CREATE_WORKFLOW,
          })}
        />
        <Drawers />
      </Box>
    );
  }

  return (
    <Box height="100%" display="grid" gridTemplateRows="100%">
      <WorkflowCanvasPanel workflowId={selectedWorkflowId} />
      <Drawers />
    </Box>
  );
};

export default WorkflowsPage;
