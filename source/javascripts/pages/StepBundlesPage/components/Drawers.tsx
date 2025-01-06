import { PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundleDrawer, StepConfigDrawer, StepSelectorDrawer } from '@/components/unified-editor';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import CreateStepBundleDialog from '@/pages/StepBundlesPage/components/CreateStepBundleDialog/CreateStepBundleDialog';

const Drawers = ({ children }: PropsWithChildren) => {
  const {
    stepBundleId,
    stepIndex,
    openDialog,
    closeDialog,
    isDialogOpen,
    unmountDialog,
    isDialogMounted,
    setStepBundleId,
  } = useStepBundlesPageStore();

  // Do we need getUniqueStepIds?
  const { addStepToStepBundle, createStepBundle, getUniqueStepIds } = useBitriseYmlStore((s) => ({
    addStepToStepBundle: s.addStepToStepBundle,
    createStepBundle: s.createStepBundle,
    getUniqueStepIds: s.getUniqueStepIds,
  }));

  const enabledSteps = new Set(getUniqueStepIds());

  const handleAddStepToStepBundle = (cvs: string) => {
    addStepToStepBundle(stepBundleId, cvs, stepIndex);
    openDialog({
      type: StepBundlesPageDialogType.STEP_CONFIG,
      stepBundleId,
      stepIndex,
    })();
  };

  const handleCreateStepBundle = (newStepBundleId: string) => {
    createStepBundle(newStepBundleId);
    setStepBundleId(newStepBundleId);
  };

  return (
    <>
      {children}
      {isDialogMounted(StepBundlesPageDialogType.CREATE_STEP_BUNDLE) && (
        <CreateStepBundleDialog
          isOpen={isDialogOpen(StepBundlesPageDialogType.CREATE_STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreateStepBundle={handleCreateStepBundle}
        />
      )}

      {isDialogMounted(StepBundlesPageDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          size="lg"
          stepBundleId={stepBundleId}
          workflowId=""
          stepIndex={stepIndex}
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(StepBundlesPageDialogType.STEP_BUNDLE) && (
        <StepBundleDrawer
          size="lg"
          workflowId=""
          stepIndex={stepIndex}
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(StepBundlesPageDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          size="lg"
          enabledSteps={enabledSteps}
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStepToStepBundle}
          onCloseComplete={unmountDialog}
          showStepBundles={!stepBundleId}
        />
      )}
    </>
  );
};

export default Drawers;
