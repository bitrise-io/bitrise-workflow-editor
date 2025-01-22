import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepConfigDrawer, StepSelectorDrawer } from '@/components/unified-editor';
import StepBundleConfigDrawer from '@/components/unified-editor/StepBundleConfigDrawer/StepBundleConfigDrawer';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import CreateStepBundleDialog from '../../../components/unified-editor/CreateStepBundleDialog/CreateStepBundleDialog';

const Drawers = () => {
  const { stepBundleId, stepIndex, openDialog, closeDialog, isDialogOpen, unmountDialog, isDialogMounted } =
    useStepBundlesPageStore();

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

  const handleCreateStepBundle = (newStepBundleId: string, baseStepBundleId?: string) => {
    createStepBundle(newStepBundleId, baseStepBundleId);
  };

  return (
    <>
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
        <StepBundleConfigDrawer
          size="lg"
          workflowId=""
          stepBundleId={stepBundleId}
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
