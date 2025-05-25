import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { bitriseYmlStore } from '../stores/BitriseYmlStore';
import StepService from './StepService';

function getUniqueStepItems(selector: (cvs: string, defaultStepLib: string) => string) {
  const items = new Set<string>();
  const { yml } = bitriseYmlStore.getState();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  // Helper function to process step objects and extract items
  const processStep = (cvs: string) => {
    items.add(selector(String(cvs), defaultStepLibrary));
  };

  // Process all workflows
  Object.entries(yml.workflows || {}).forEach(([_, workflow]) => {
    workflow?.steps?.forEach((stepLikeObject) => {
      Object.entries(stepLikeObject).forEach(([cvsLike, stepLike]) => {
        const cvsString = String(cvsLike);

        if (StepService.isStep(cvsString, defaultStepLibrary, stepLike)) {
          processStep(cvsString);
        }

        if (StepService.isWithGroup(cvsString, defaultStepLibrary, stepLike)) {
          stepLike?.steps?.forEach((stepObj) => {
            Object.entries(stepObj).forEach(([cvs]) => processStep(String(cvs)));
          });
        }

        if (StepService.isStepBundle(cvsString, defaultStepLibrary, stepLike)) {
          const { id: stepBundleId } = StepService.parseStepCVS(cvsString, defaultStepLibrary);
          const stepBundle = yml.step_bundles?.[stepBundleId];

          stepBundle?.steps?.forEach((stepObj) => {
            Object.entries(stepObj).forEach(([cvs]) => processStep(String(cvs)));
          });
        }
      });
    });
  });

  return Array.from(items);
}

function getUniqueStepIds(): string[] {
  return getUniqueStepItems((cvs, defaultStepLib) => {
    return StepService.parseStepCVS(cvs, defaultStepLib).id;
  });
}

function getUniqueStepCvss(): string[] {
  return getUniqueStepItems((cvs) => String(cvs));
}

export default {
  getUniqueStepIds,
  getUniqueStepCvss,
};
