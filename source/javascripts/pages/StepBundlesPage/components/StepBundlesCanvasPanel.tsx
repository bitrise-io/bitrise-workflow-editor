import { useCallback } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { moveStepIndices } from '@/utils/stepSelectionHandlers';
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

  const { closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices } = useStepBundlesPageStore();

  const handleSelectStep = useCallback<(props: { isMultiple?: boolean; stepIndex: number }) => void>(
    ({ isMultiple, stepIndex }) => {
      if (isMultiple) {
        let newIndexes = [...selectedStepIndices, stepIndex];
        if (selectedStepIndices.includes(stepIndex)) {
          newIndexes = selectedStepIndices.filter((i: number) => i !== stepIndex);
        }
        if (newIndexes.length !== 1) {
          closeDialog();
        }
        setSelectedStepIndices(newIndexes);
      } else {
        openDialog({
          type: StepBundlesPageDialogType.STEP_CONFIG,
          selectedStepIndices: [stepIndex],
        })();
      }
    },
    [closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices],
  );

  const openStepSelectorDrawer = useCallback(
    (_bundleId: string, stepIndex: number) => {
      openDialog({
        type: StepBundlesPageDialogType.STEP_SELECTOR,
        selectedStepIndices: [stepIndex],
      })();
    },
    [openDialog],
  );

  const handleCloneStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      cloneStepInStepBundle(bundleId, stepIndex);

      // Adjust index of the selected steps
      setSelectedStepIndices(moveStepIndices('clone', selectedStepIndices, stepIndex));
    },
    [cloneStepInStepBundle, selectedStepIndices, setSelectedStepIndices],
  );

  const handleDeleteStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      deleteStepInStepBundle(bundleId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (selectedStepIndices.includes(stepIndex)) {
        closeDialog();
      }
      // Adjust index of the selected steps
      setSelectedStepIndices(moveStepIndices('remove', selectedStepIndices, stepIndex));
    },
    [deleteStepInStepBundle, selectedStepIndices, setSelectedStepIndices, closeDialog],
  );

  const handleMoveStep = useCallback(
    (bundleId: string, stepIndex: number, targetIndex: number) => {
      moveStepInStepBundle(bundleId, stepIndex, targetIndex);

      // Adjust index of the selected steps
      setSelectedStepIndices(moveStepIndices('move', selectedStepIndices, stepIndex, targetIndex));
    },
    [moveStepInStepBundle, selectedStepIndices, setSelectedStepIndices],
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
            onSelectStep={handleSelectStep}
            onUpgradeStepInStepBundle={upgradeStepInStepBundle}
            selectedStepIndices={selectedStepIndices}
          >
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${stepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
