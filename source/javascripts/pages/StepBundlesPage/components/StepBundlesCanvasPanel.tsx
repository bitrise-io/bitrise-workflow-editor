import { useCallback } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import StepBundlesSelector from '@/pages/StepBundlesPage/components/StepBundlesSelector';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';

type Props = {
  stepBundleId: string;
};

const StepBundlesCanvasPanel = ({ stepBundleId }: Props) => {
  const { cloneStepInStepBundle, deleteStepInStepBundle, moveStepInStepBundle, upgradeStepInStepBundle } =
    useBitriseYmlStore((s) => ({
      cloneStepInStepBundle: s.cloneStepInStepBundle,
      deleteStepInStepBundle: s.deleteStepInStepBundle,
      moveStepInStepBundle: s.moveStepInStepBundle,
      upgradeStepInStepBundle: s.changeStepVersionInStepBundle,
    }));

  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const closeDialog = useStepBundlesPageStore((s) => s.closeDialog);
  const selectedStepBundleId = useStepBundlesPageStore((s) => s.stepBundleId);
  const selectedStepIndex = useStepBundlesPageStore((s) => s.stepIndex);
  const setStepIndex = useStepBundlesPageStore((s) => s.setStepIndex);

  const openStepSelectorDrawer = useCallback(
    (bundleId: string, stepIndex: number) => {
      openDialog({
        type: StepBundlesPageDialogType.STEP_SELECTOR,
        stepBundleId: bundleId,
        stepIndex,
      })();
    },
    [openDialog],
  );

  const handleCloneStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      cloneStepInStepBundle(bundleId, stepIndex);

      // Adjust index if the selected step is cloned
      if (bundleId === selectedStepBundleId && stepIndex === selectedStepIndex) {
        setStepIndex(selectedStepIndex + 1);
      }
    },
    [cloneStepInStepBundle, selectedStepBundleId, selectedStepIndex, setStepIndex],
  );

  const handleDeleteStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      deleteStepInStepBundle(bundleId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (bundleId === selectedStepBundleId && stepIndex === selectedStepIndex) {
        closeDialog();
      }

      // Adjust index if a step is deleted before the selected step
      if (bundleId === selectedStepBundleId && stepIndex < selectedStepIndex) {
        setStepIndex(selectedStepIndex - 1);
      }
    },
    [closeDialog, deleteStepInStepBundle, selectedStepBundleId, selectedStepIndex, setStepIndex],
  );

  const handleMoveStep = useCallback(
    (bundleId: string, stepIndex: number, targetIndex: number) => {
      moveStepInStepBundle(bundleId, stepIndex, targetIndex);

      // Adjust index if the selected step is moved
      if (bundleId === selectedStepBundleId && selectedStepIndex === stepIndex) {
        setStepIndex(targetIndex);
      }
    },
    [moveStepInStepBundle, selectedStepBundleId, selectedStepIndex, setStepIndex],
  );

  return (
    <ReactFlowProvider>
      <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
        <Box
          p="12"
          display="flex"
          gap="12"
          bg="background/primary"
          borderBottom="1px solid"
          borderColor="border/regular"
        >
          <StepBundlesSelector />
        </Box>
        <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
          <WorkflowCardContextProvider
            onAddStepToStepBundle={openStepSelectorDrawer}
            onCloneStepInStepBundle={handleCloneStep}
            onDeleteStepInStepBundle={handleDeleteStep}
            onMoveStepInStepBundle={handleMoveStep}
            onUpgradeStepInStepBundle={upgradeStepInStepBundle}
          >
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${stepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
