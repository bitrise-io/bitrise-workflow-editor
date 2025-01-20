import { useCallback, useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import StepBundlesSelector from './StepBundlesSelector';

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

  const {
    closeDialog,
    openDialog,
    selectedStepIndices,
    stepIndex: selectedStepIndex,
    setStepIndex,
    setSelectedStepIndices,
  } = useStepBundlesPageStore();

  useEffect(() => {
    if (selectedStepIndices.length === 1) {
      openDialog({
        type: StepBundlesPageDialogType.STEP_CONFIG,
        stepIndex: selectedStepIndices[0],
      })();
    } else {
      closeDialog();
    }
  }, [closeDialog, openDialog, selectedStepIndices]);

  const openStepSelectorDrawer = useCallback(
    (_bundleId: string, stepIndex: number) => {
      openDialog({
        type: StepBundlesPageDialogType.STEP_SELECTOR,
        stepIndex,
      })();
    },
    [openDialog],
  );

  const handleCloneStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      cloneStepInStepBundle(bundleId, stepIndex);

      // Adjust index if the selected step is cloned
      if (bundleId === stepBundleId && stepIndex === selectedStepIndex) {
        setStepIndex(selectedStepIndex + 1);
        setSelectedStepIndices([selectedStepIndex + 1]);
      }
    },
    [cloneStepInStepBundle, stepBundleId, selectedStepIndex, setStepIndex, setSelectedStepIndices],
  );

  const handleDeleteStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      deleteStepInStepBundle(bundleId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (bundleId === stepBundleId && stepIndex === selectedStepIndex) {
        closeDialog();
      }

      // Adjust index if a step is deleted before the selected step
      if (bundleId === stepBundleId && stepIndex < selectedStepIndex) {
        setStepIndex(selectedStepIndex - 1);
      }
    },
    [closeDialog, deleteStepInStepBundle, stepBundleId, selectedStepIndex, setStepIndex],
  );

  const handleMoveStep = useCallback(
    (bundleId: string, stepIndex: number, targetIndex: number) => {
      moveStepInStepBundle(bundleId, stepIndex, targetIndex);

      // Adjust index if the selected step is moved
      if (bundleId === stepBundleId && selectedStepIndex === stepIndex) {
        setStepIndex(targetIndex);
        setSelectedStepIndices([targetIndex]);
      }
    },
    [moveStepInStepBundle, stepBundleId, selectedStepIndex, setStepIndex, setSelectedStepIndices],
  );

  return (
    <ReactFlowProvider>
      <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
        <Box p="12" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
          <StepBundlesSelector />
        </Box>
        <Box
          display="flex"
          flexDir="column"
          flex="1"
          alignItems="center"
          overflowY="auto"
          p="16"
          bg="background/secondary"
        >
          <WorkflowCardContextProvider
            onAddStepToStepBundle={openStepSelectorDrawer}
            onCloneStepInStepBundle={handleCloneStep}
            onDeleteStepInStepBundle={handleDeleteStep}
            onMoveStepInStepBundle={handleMoveStep}
            onUpgradeStepInStepBundle={upgradeStepInStepBundle}
            selectedStepIndices={selectedStepIndices}
            setSelectedStepIndices={setSelectedStepIndices}
          >
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${stepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
