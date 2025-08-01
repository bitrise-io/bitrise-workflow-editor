import { Box } from '@bitrise/bitkit';
import { useCallback } from 'react';

import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import StepService, { moveStepIndices } from '@/core/services/StepService';
import { useShallow } from '@/hooks/useShallow';
import { useStepBundles } from '@/hooks/useStepBundles';

import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import StepBundlesSelector from './StepBundlesSelector';

type Props = {
  stepBundleId: string;
};

const StepBundlesCanvasPanel = ({ stepBundleId }: Props) => {
  const stepBundles = useStepBundles((s) => {
    return Object.fromEntries(
      Object.entries(s).map(([id, stepBundle]) => {
        return [id, { steps: stepBundle?.steps }];
      }),
    );
  });

  const { closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices, selectionParent } =
    useStepBundlesPageStore(
      useShallow((s) => ({
        closeDialog: s.closeDialog,
        openDialog: s.openDialog,
        selectedStepIndices: s.selectedStepIndices,
        selectionParent: s.selectionParent,
        setSelectedStepIndices: s.setSelectedStepIndices,
      })),
    );

  const handleSelectStep = useCallback<
    (props: { isMultiple?: boolean; stepIndex: number; type: LibraryType; stepBundleId?: string }) => void
  >(
    ({ isMultiple, stepIndex, stepBundleId: parentStepBundleId = '', type }) => {
      const newSelectionParent: SelectionParent = {
        id: parentStepBundleId,
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
          stepBundleId: parentStepBundleId,
        })();
      } else {
        openDialog({
          type: StepBundlesPageDialogType.STEP_CONFIG,
          selectedStepIndices: [stepIndex],
          selectionParent: newSelectionParent,
          stepBundleId: parentStepBundleId,
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
    (parentStepBundleId: string, stepIndex: number) => {
      StepService.cloneStep('step_bundles', parentStepBundleId, stepIndex);

      if (selectionParent?.id === parentStepBundleId) {
        // Adjust index of the selected steps
        setSelectedStepIndices(moveStepIndices('clone', selectedStepIndices, stepIndex));
      }
    },
    [selectedStepIndices, selectionParent?.id, setSelectedStepIndices],
  );

  const handleDeleteStep = useCallback(
    (parentStepBundleId: string, stepIndices: number[], cvs?: string) => {
      StepService.deleteStep('step_bundles', parentStepBundleId, stepIndices);

      if (selectionParent?.id === parentStepBundleId) {
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
    [selectionParent?.id, selectedStepIndices, closeDialog, setSelectedStepIndices, stepBundles],
  );

  const handleMoveStep = useCallback(
    (parentStepBundleId: string, stepIndex: number, targetIndex: number) => {
      StepService.moveStep('step_bundles', parentStepBundleId, stepIndex, targetIndex);

      if (selectionParent?.id === parentStepBundleId) {
        // Adjust index of the selected steps
        setSelectedStepIndices(moveStepIndices('move', selectedStepIndices, stepIndex, targetIndex));
      }
    },
    [selectedStepIndices, selectionParent?.id, setSelectedStepIndices],
  );

  const handleGroupStepsToStepBundle = useCallback(
    (
      _parentWorkflowId: string | undefined,
      parentStepBundleId: string | undefined,
      newStepBundleId: string,
      stepIndices: number[],
    ) => {
      StepBundleService.groupStepsToStepBundle(newStepBundleId, {
        source: 'step_bundles',
        sourceId: parentStepBundleId || '',
        steps: stepIndices,
      });
      setSelectedStepIndices([Math.min(...stepIndices)]);
      openDialog({
        type: StepBundlesPageDialogType.STEP_BUNDLE,
        stepBundleId: parentStepBundleId,
        newStepBundleId,
        selectedStepIndices: [Math.min(...stepIndices)],
      })();
    },
    [openDialog, setSelectedStepIndices],
  );

  const upgradeStepInStepBundle = useCallback((bundleId: string, stepIndex: number, version: string) => {
    StepService.changeStepVersion('step_bundles', bundleId, stepIndex, version);
  }, []);

  return (
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
  );
};

export default StepBundlesCanvasPanel;
