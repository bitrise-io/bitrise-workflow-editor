import { useCallback } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { moveStepIndices } from '@/utils/stepSelectionHandlers';
import { LibraryType } from '@/core/models/Step';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import StepBundlesSelector from './StepBundlesSelector';

type Props = {
  selectedStepBundleId: string;
};

const StepBundlesCanvasPanel = ({ selectedStepBundleId }: Props) => {
  const { cloneStepInStepBundle, deleteStepInStepBundle, moveStepInStepBundle, upgradeStepInStepBundle } =
    useBitriseYmlStore((s) => ({
      cloneStepInStepBundle: s.cloneStepInStepBundle,
      deleteStepInStepBundle: s.deleteStepInStepBundle,
      moveStepInStepBundle: s.moveStepInStepBundle,
      upgradeStepInStepBundle: s.changeStepVersionInStepBundle,
    }));

  const { closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices, stepBundleId } =
    useStepBundlesPageStore();

  const handleSelectStep = useCallback<(props: { isMultiple?: boolean; stepIndex: number; type: LibraryType }) => void>(
    ({ isMultiple, stepIndex, type }) => {
      if (isMultiple) {
        let newIndices = [...selectedStepIndices, stepIndex];
        if (selectedStepIndices.includes(stepIndex)) {
          newIndices = selectedStepIndices.filter((i: number) => i !== stepIndex);
        }
        if (newIndices.length !== 1) {
          closeDialog();
        }
        setSelectedStepIndices(newIndices);
      } else if (type === LibraryType.BUNDLE) {
        openDialog({
          type: StepBundlesPageDialogType.STEP_BUNDLE,
          selectedStepIndices: [stepIndex],
        })();
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
    (parentStepBundleId: string, stepIndex: number) => {
      openDialog({
        type: StepBundlesPageDialogType.STEP_SELECTOR,
        selectedStepIndices: [stepIndex],
        stepBundleId: parentStepBundleId,
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
    (bundleId: string, stepIndices: number[]) => {
      deleteStepInStepBundle(bundleId, stepIndices);

      // Close the dialog if the selected step is deleted
      if (selectedStepIndices.length === 1 && selectedStepIndices.includes(stepIndices[0])) {
        closeDialog();
      }
      // Adjust index of the selected steps
      if (selectedStepIndices.includes(stepIndices[0])) {
        setSelectedStepIndices([]);
      } else {
        setSelectedStepIndices(moveStepIndices('remove', selectedStepIndices, stepIndices[0]));
      }
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
            selectionParent={{
              id: stepBundleId || selectedStepBundleId,
              type: 'stepBundle',
            }}
          >
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${selectedStepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
