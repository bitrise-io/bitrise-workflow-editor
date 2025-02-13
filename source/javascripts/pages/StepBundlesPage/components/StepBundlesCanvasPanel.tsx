import { useCallback } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { moveStepIndices } from '@/utils/stepSelectionHandlers';
import { LibraryType } from '@/core/models/Step';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { useStepBundles } from '@/hooks/useStepBundles';
import StepBundleService from '@/core/models/StepBundleService';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import StepBundlesSelector from './StepBundlesSelector';

type Props = {
  stepBundleId: string;
};

const StepBundlesCanvasPanel = ({ stepBundleId }: Props) => {
  const stepBundles = useStepBundles();

  const {
    cloneStepInStepBundle,
    deleteStepInStepBundle,
    groupStepsToStepBundle,
    moveStepInStepBundle,
    upgradeStepInStepBundle,
  } = useBitriseYmlStore((s) => ({
    cloneStepInStepBundle: s.cloneStepInStepBundle,
    deleteStepInStepBundle: s.deleteStepInStepBundle,
    groupStepsToStepBundle: s.groupStepsToStepBundle,
    moveStepInStepBundle: s.moveStepInStepBundle,
    upgradeStepInStepBundle: s.changeStepVersionInStepBundle,
  }));

  const { closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices, selectionParent } =
    useStepBundlesPageStore();

  const handleSelectStep = useCallback<
    (props: { isMultiple?: boolean; stepIndex: number; type: LibraryType; stepBundleId?: string }) => void
  >(
    ({ isMultiple, stepIndex, stepBundleId: bundleId = '', type }) => {
      const newSelectionParent: SelectionParent = {
        id: bundleId,
        type: 'stepBundle',
      };
      if (isMultiple) {
        let newIndices = [...selectedStepIndices, stepIndex];
        if (selectedStepIndices.includes(stepIndex)) {
          newIndices = selectedStepIndices.filter((i: number) => i !== stepIndex);
        }
        if (newIndices.length !== 1) {
          closeDialog();
        }
        useStepBundlesPageStore.setState({
          selectedStepIndices: newIndices,
          selectionParent: newSelectionParent,
        });
      } else if (type === LibraryType.BUNDLE) {
        openDialog({
          type: StepBundlesPageDialogType.STEP_BUNDLE,
          selectedStepIndices: [stepIndex],
          selectionParent: newSelectionParent,
          stepBundleId: bundleId,
        })();
      } else {
        openDialog({
          type: StepBundlesPageDialogType.STEP_CONFIG,
          selectedStepIndices: [stepIndex],
          selectionParent: newSelectionParent,
          stepBundleId: bundleId,
        })();
      }
    },
    [closeDialog, openDialog, selectedStepIndices],
  );

  const openStepSelectorDrawer = useCallback(
    (parentStepBundleId: string, stepIndex: number) => {
      openDialog({
        type: StepBundlesPageDialogType.STEP_SELECTOR,
        selectedStepIndices: [stepIndex],
        stepBundleId: parentStepBundleId,
        selectionParent: {
          id: parentStepBundleId,
          type: 'stepBundle',
        },
      })();
    },
    [openDialog],
  );

  const handleCloneStep = useCallback(
    (bundleId: string, stepIndex: number) => {
      cloneStepInStepBundle(bundleId, stepIndex);

      if (selectionParent?.id === bundleId) {
        // Adjust index of the selected steps
        setSelectedStepIndices(moveStepIndices('clone', selectedStepIndices, stepIndex));
      }
    },
    [cloneStepInStepBundle, selectedStepIndices, selectionParent?.id, setSelectedStepIndices],
  );

  const handleDeleteStep = useCallback(
    (bundleId: string, stepIndices: number[], cvs?: string) => {
      deleteStepInStepBundle(bundleId, stepIndices);

      if (selectionParent?.id === bundleId) {
        // Close the dialog if the selected step is deleted
        if (selectedStepIndices.includes(stepIndices[0])) {
          closeDialog();
        }
        // Adjust index of the selected steps
        if (selectedStepIndices.includes(stepIndices[0])) {
          setSelectedStepIndices([]);
        } else {
          setSelectedStepIndices(moveStepIndices('remove', selectedStepIndices, stepIndices[0]));
        }
      }
      if (cvs?.startsWith('bundle::')) {
        const id = StepBundleService.cvsToId(cvs);
        if (selectionParent?.id === id) {
          closeDialog();
        }
        if (
          selectionParent?.id &&
          StepBundleService.getStepBundleChain(stepBundles, id).includes(selectionParent?.id)
        ) {
          closeDialog();
        }
      }
    },
    [
      deleteStepInStepBundle,
      selectionParent?.id,
      selectedStepIndices,
      closeDialog,
      setSelectedStepIndices,
      stepBundles,
    ],
  );

  const handleMoveStep = useCallback(
    (bundleId: string, stepIndex: number, targetIndex: number) => {
      moveStepInStepBundle(bundleId, stepIndex, targetIndex);

      if (selectionParent?.id === bundleId) {
        // Adjust index of the selected steps
        setSelectedStepIndices(moveStepIndices('move', selectedStepIndices, stepIndex, targetIndex));
      }
    },
    [moveStepInStepBundle, selectedStepIndices, selectionParent?.id, setSelectedStepIndices],
  );

  const handleGroupStepsToStepBundle = useCallback(
    (_workflowId: string | undefined, bundleId: string | undefined, newStepBundleId: string, stepIndices: number[]) => {
      groupStepsToStepBundle(undefined, bundleId, newStepBundleId, stepIndices);
      setSelectedStepIndices([Math.min(...stepIndices)]);
      openDialog({
        type: StepBundlesPageDialogType.STEP_BUNDLE,
        stepBundleId: bundleId,
        newStepBundleId,
        selectedStepIndices: [Math.min(...stepIndices)],
      })();
    },
    [groupStepsToStepBundle, openDialog, setSelectedStepIndices],
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
            onGroupStepsToStepBundle={handleGroupStepsToStepBundle}
            selectedStepIndices={selectedStepIndices}
            selectionParent={selectionParent}
          >
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${stepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
