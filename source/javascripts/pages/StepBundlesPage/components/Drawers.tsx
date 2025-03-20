import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundleConfigDrawer, StepConfigDrawer, StepSelectorDrawer } from '@/components/unified-editor';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';
import CreateStepBundleDialog, {
  StepBundleBaseEntityType,
} from '../../../components/unified-editor/CreateStepBundleDialog/CreateStepBundleDialog';

const Drawers = () => {
  const { closeDialog, isDialogOpen, openDialog, unmountDialog, isDialogMounted, selectedStepIndices, stepBundleId } =
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
        stepBundleId,
      })();
    }
  };

  const handleCreateStepBundle = (newId: string, baseEntityId?: string) => {
    const [type, baseId] = baseEntityId?.split('#') || [];
    if (!type || type === StepBundleBaseEntityType.STEP_BUNDLES) {
      createStepBundle(newId, baseId);
    }
    if (type === StepBundleBaseEntityType.WORKFLOWS) {
      createStepBundle(newId, undefined, baseId);
    }
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
          parentStepBundleId={stepBundleId}
        />
      )}

      {isDialogMounted(StepBundlesPageDialogType.STEP_BUNDLE) && (
        <StepBundleConfigDrawer
          size="lg"
          isOpen={isDialogOpen(StepBundlesPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          stepIndex={selectedStepIndices[0]}
          parentStepBundleId={stepBundleId}
        />
      )}
    </>
  );
};

export default Drawers;
