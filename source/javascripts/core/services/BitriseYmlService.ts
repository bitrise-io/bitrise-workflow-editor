import { mapValues } from 'es-toolkit';

import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { bitriseYmlStore } from '../stores/BitriseYmlStore';
import StepService from './StepService';

function getUniqueStepIds() {
  const ids = new Set<string>();
  const { yml } = bitriseYmlStore.getState();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  mapValues(yml.workflows || {}, (workflow) => {
    workflow?.steps?.forEach((stepLikeObject) => {
      mapValues(stepLikeObject, (stepLike, cvsLike) => {
        if (StepService.isStep(String(cvsLike), defaultStepLibrary, stepLike)) {
          const { id } = StepService.parseStepCVS(String(cvsLike), defaultStepLibrary);
          ids.add(id);
        }

        if (StepService.isWithGroup(String(cvsLike), defaultStepLibrary, stepLike)) {
          stepLike?.steps?.forEach((stepObj) => {
            mapValues(stepObj, (_, cvs) => {
              const { id } = StepService.parseStepCVS(String(cvs), defaultStepLibrary);
              ids.add(id);
            });
          });
        }

        if (StepService.isStepBundle(String(cvsLike), defaultStepLibrary, stepLike)) {
          const { id: stepBundleId } = StepService.parseStepCVS(String(cvsLike), defaultStepLibrary);
          const stepBundle = yml.step_bundles?.[stepBundleId];
          if (stepBundle) {
            stepBundle.steps?.forEach((stepObj) => {
              mapValues(stepObj, (_, cvs) => {
                const { id } = StepService.parseStepCVS(String(cvs), defaultStepLibrary);
                ids.add(id);
              });
            });
          }
        }
      });
    });
  });

  return Array.from(ids);
}

function getUniqueStepCvss() {
  const cvss = new Set<string>();
  const { yml } = bitriseYmlStore.getState();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  mapValues(yml.workflows || {}, (workflow) => {
    workflow?.steps?.forEach((stepLikeObject) => {
      mapValues(stepLikeObject, (stepLike, cvsLike) => {
        if (StepService.isStep(String(cvsLike), defaultStepLibrary, stepLike)) {
          cvss.add(String(cvsLike));
        }

        if (StepService.isWithGroup(String(cvsLike), defaultStepLibrary, stepLike)) {
          stepLike?.steps?.forEach((stepObj) => {
            mapValues(stepObj, (_, cvs) => {
              cvss.add(String(cvs));
            });
          });
        }

        if (StepService.isStepBundle(String(cvsLike), defaultStepLibrary, stepLike)) {
          const { id: stepBundleId } = StepService.parseStepCVS(String(cvsLike), defaultStepLibrary);
          const stepBundle = yml.step_bundles?.[stepBundleId];
          if (stepBundle) {
            stepBundle.steps?.forEach((stepObj) => {
              mapValues(stepObj, (_, cvs) => {
                cvss.add(String(cvs));
              });
            });
          }
        }
      });
    });
  });

  return Array.from(cvss);
}

export default {
  getUniqueStepIds,
  getUniqueStepCvss,
};
