import StepBundleConfigDrawer from '@/components/unified-editor/StepBundleConfig/StepBundleConfigDrawer';
import StepConfigDrawer from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer';
import StepSelectorDrawer from '@/components/unified-editor/StepSelectorDrawer/StepSelectorDrawer';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import CreateStepBundleDialog, {
  StepBundleBaseEntityType,
} from '../../../components/unified-editor/CreateStepBundleDialog/CreateStepBundleDialog';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';

const Drawers = () => {
  const { closeDialog, isDialogOpen, openDialog, unmountDialog, isDialogMounted, selectedStepIndices, stepBundleId } =
    useStepBundlesPageStore();

  const { createStepBundle, getUniqueStepIds } = useBitriseYmlStore((s) => ({
    createStepBundle: s.createStepBundle,
    getUniqueStepIds: s.getUniqueStepIds,
  }));

  const enabledSteps = new Set(getUniqueStepIds());

  const handleAddStepToStepBundle = (cvs: string) => {
    const { id, library, version } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    const cvsWithLatestMajorVersion = `${id}@${version.split('.')[0]}`;
    const source = 'step_bundles';
    const sourceId = stepBundleId;
    const wantsToAddAStepBundle = library === LibraryType.BUNDLE;

    if (wantsToAddAStepBundle) {
      StepService.addStep(source, sourceId, cvs, selectedStepIndices[0]);
      openDialog({ type: StepBundlesPageDialogType.STEP_BUNDLE, stepBundleId })();
    } else {
      StepService.addStep(source, sourceId, cvsWithLatestMajorVersion, selectedStepIndices[0]);
      openDialog({ type: StepBundlesPageDialogType.STEP_CONFIG, selectedStepIndices, stepBundleId })();
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
