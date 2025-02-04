import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepConfigDrawer, StepSelectorDrawer } from '@/components/unified-editor';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import CreateStepBundleDialog from '../../../components/unified-editor/CreateStepBundleDialog/CreateStepBundleDialog';

type Props = {
  stepBundleId: string;
};

const Drawers = ({ stepBundleId }: Props) => {
  const { closeDialog, isDialogOpen, openDialog, unmountDialog, isDialogMounted, selectedStepIndices } =
    useStepBundlesPageStore();

  const { addStepToStepBundle, createStepBundle, getUniqueStepIds } = useBitriseYmlStore((s) => ({
    addStepToStepBundle: s.addStepToStepBundle,
    createStepBundle: s.createStepBundle,
    getUniqueStepIds: s.getUniqueStepIds,
  }));

  const enabledSteps = new Set(getUniqueStepIds());

  const handleAddStepToStepBundle = (cvs: string) => {
    addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
    openDialog({
      type: StepBundlesPageDialogType.STEP_CONFIG,
      selectedStepIndices,
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
          stepIndex={selectedStepIndices[0]}
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_CONFIG)}
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
          showStepBundles={false}
        />
      )}
    </>
  );
};

export default Drawers;
