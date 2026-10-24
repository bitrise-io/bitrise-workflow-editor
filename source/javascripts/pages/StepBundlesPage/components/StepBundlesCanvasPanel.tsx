import { Box } from '@chakra-ui/react/box';
import { useCallback } from 'react';

import { CANVAS_EDGE_SHADOW, canvasDotsBackground } from '@/components/unified-editor/canvasDots';
import { FLOATING_DRAWER_WIDTH } from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import StepService, { moveStepIndices } from '@/core/services/StepService';
import { useShallow } from '@/hooks/useShallow';
import { useStepBundles } from '@/hooks/useStepBundles';

import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';

// The create dialog covers the page; everything else is a drawer beside the canvas.
const DIALOGS_WITHOUT_DRAWER = [StepBundlesPageDialogType.NONE, StepBundlesPageDialogType.CREATE_STEP_BUNDLE];

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

  const isDrawerOpen = useStepBundlesPageStore(
    (s) => s.isSwitchingDialog || !DIALOGS_WITHOUT_DRAWER.includes(s.openedDialogType),
  );
  const { closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices, selectionParent, isAddingStep } =
    useStepBundlesPageStore(
      useShallow((s) => ({
        closeDialog: s.closeDialog,
        openDialog: s.openDialog,
        selectedStepIndices: s.selectedStepIndices,
        selectionParent: s.selectionParent,
        setSelectedStepIndices: s.setSelectedStepIndices,
        isAddingStep: s.openedDialogType === StepBundlesPageDialogType.STEP_SELECTOR,
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
    <Box height="100%" display="flex" flexDirection="column" minWidth={[256, 320, 400]}>
      <Box
        display="flex"
        flexDirection="column"
        flex="1"
        alignItems="center"
        overflowY="auto"
        padding="16"
        // Keeps the card in view beside an open drawer rather than under it.
        paddingInlineEnd={['16', isDrawerOpen ? `calc(${FLOATING_DRAWER_WIDTH} + 32px)` : '16']}
        transition="padding-inline-end 200ms"
        background="background/secondary"
        {...canvasDotsBackground}
        // An inset shadow stays put while the content scrolls.
        boxShadow={CANVAS_EDGE_SHADOW}
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
          isAddingStep={isAddingStep}
        >
          <StepBundleCard
            uniqueId=""
            stepIndex={-1}
            cvs={`bundle::${stepBundleId}`}
            onEditStepBundle={openDialog({ type: StepBundlesPageDialogType.STEP_BUNDLE_DEFINITION, stepBundleId })}
          />
        </WorkflowCardContextProvider>
      </Box>
    </Box>
  );
};

export default StepBundlesCanvasPanel;
