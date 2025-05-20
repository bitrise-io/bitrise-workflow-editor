import { mapValues } from 'es-toolkit';

import { BitriseYml, EnvModel } from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { deepCloneSimpleObject } from '../utils/CommonUtils';
// eslint-disable-next-line import/no-cycle
import StepBundleService from './StepBundleService';
import StepService from './StepService';

function updateStepBundleInputInstanceValue(
  key: string,
  newValue: string,
  parentStepBundleId: string | undefined,
  parentWorkflowId: string | undefined,
  cvs: string,
  stepIndex: number,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (parentStepBundleId && parentWorkflowId) {
    throw new Error('parentStepBundleId and parentWorkflowId cannot be set at the same time');
  }

  let isParentExists = false;
  if (parentStepBundleId) {
    isParentExists = !!copy.step_bundles?.[parentStepBundleId];
  }
  if (parentWorkflowId) {
    isParentExists = !!copy.workflows?.[parentWorkflowId];
  }

  const originalInputs = copy.step_bundles?.[StepBundleService.cvsToId(cvs)]?.inputs || [];
  const isOriginalInputExists = originalInputs?.findIndex(({ opts, ...i }) => Object.keys(i)[0] === key) > -1;

  if (!isParentExists || key === 'opts' || !isOriginalInputExists) {
    return copy;
  }

  let inputs: EnvModel = [];
  if (parentWorkflowId && copy.workflows?.[parentWorkflowId]?.steps?.[stepIndex]) {
    inputs = copy.workflows[parentWorkflowId].steps[stepIndex][cvs].inputs || [];
  }
  if (parentStepBundleId && copy.step_bundles?.[parentStepBundleId]?.steps?.[stepIndex]) {
    inputs = copy.step_bundles[parentStepBundleId].steps[stepIndex][cvs].inputs || [];
  }

  const inputIndex = inputs?.findIndex(({ opts, ...i }) => Object.keys(i)[0] === key);
  if (newValue) {
    if (inputIndex === -1) {
      inputs.push({ [key]: newValue });
    } else {
      inputs[inputIndex] = { ...inputs[inputIndex], [key]: newValue };
    }
  } else {
    inputs.splice(inputIndex, 1);
  }

  if (parentWorkflowId && copy.workflows?.[parentWorkflowId].steps?.[stepIndex]) {
    if (inputs.length) {
      copy.workflows[parentWorkflowId].steps[stepIndex][cvs].inputs = inputs.length ? inputs : undefined;
    } else {
      delete copy.workflows[parentWorkflowId].steps[stepIndex][cvs].inputs;
    }
  }

  if (parentStepBundleId && copy.step_bundles?.[parentStepBundleId].steps?.[stepIndex]) {
    if (inputs.length) {
      copy.step_bundles[parentStepBundleId].steps[stepIndex][cvs].inputs = inputs;
    } else {
      delete copy.step_bundles[parentStepBundleId].steps[stepIndex][cvs].inputs;
    }
  }

  return copy;
}

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
  updateStepBundleInputInstanceValue,
};
