import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundleConfigDrawer, StepConfigDrawer, StepSelectorDrawer } from '@/components/unified-editor';
import StepService from '@/core/models/StepService';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
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
    const { library } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
    if (library === LibraryType.BUNDLE) {
      openDialog({
        type: StepBundlesPageDialogType.STEP_BUNDLE,
        stepBundleId,
      })();
    } else {
      openDialog({
        type: StepBundlesPageDialogType.STEP_CONFIG,
        selectedStepIndices,
      })();
    }
  };

  return (
    <>
      {isDialogMounted(StepBundlesPageDialogType.CREATE_STEP_BUNDLE) && (
        <CreateStepBundleDialog
          isOpen={isDialogOpen(StepBundlesPageDialogType.CREATE_STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreateStepBundle={createStepBundle}
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
        />
      )}

      {isDialogMounted(StepBundlesPageDialogType.STEP_BUNDLE) && (
        <StepBundleConfigDrawer
          size="lg"
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onRename={console.log}
          workflowId=""
          stepIndex={selectedStepIndices[0]}
          stepBundleId={stepBundleId}
        />
      )}
    </>
  );
};

export default Drawers;
