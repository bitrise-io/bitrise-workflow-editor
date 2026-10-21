import { Box } from '@chakra-ui/react/box';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (selectedWorkflowId) {
      openDialog({ type: WorkflowsPageDialogType.WORKFLOW_CONFIG, workflowId: selectedWorkflowId })();
    } else {
      closeDialog();
    }
  }, [selectedWorkflowId, openDialog, closeDialog]);

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
