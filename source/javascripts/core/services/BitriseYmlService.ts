import { mapValues } from 'es-toolkit';

import { BitriseYml } from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import StepService from './StepService';

function getUniqueStepIds(yml: BitriseYml) {
  const ids = new Set<string>();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  mapValues(yml.workflows || {}, (workflow) => {
    workflow.steps?.forEach((stepLikeObject) => {
      mapValues(stepLikeObject, (stepLike, cvsLike) => {
        if (StepService.isStep(String(cvsLike), defaultStepLibrary, stepLike)) {
          const { id } = StepService.parseStepCVS(String(cvsLike), defaultStepLibrary);
          ids.add(id);
        }

        if (
          StepService.isStepBundle(String(cvsLike), defaultStepLibrary, stepLike) ||
          StepService.isWithGroup(String(cvsLike), defaultStepLibrary, stepLike)
        ) {
          stepLike.steps?.forEach((stepObj) => {
            mapValues(stepObj, (_, cvs) => {
              const { id } = StepService.parseStepCVS(String(cvs), defaultStepLibrary);
              ids.add(id);
            });
          });
        }
      });
    });
  });

  return Array.from(ids);
}

function getUniqueStepCvss(yml: BitriseYml) {
  const cvss = new Set<string>();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  mapValues(yml.workflows || {}, (workflow) => {
    workflow.steps?.forEach((stepLikeObject) => {
      mapValues(stepLikeObject, (stepLike, cvsLike) => {
        if (StepService.isStep(String(cvsLike), defaultStepLibrary, stepLike)) {
          cvss.add(String(cvsLike));
        }

        if (
          StepService.isStepBundle(String(cvsLike), defaultStepLibrary, stepLike) ||
          StepService.isWithGroup(String(cvsLike), defaultStepLibrary, stepLike)
        ) {
          stepLike.steps?.forEach((stepObj) => {
            mapValues(stepObj, (_, cvs) => {
              cvss.add(String(cvs));
            });
          });
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
