import { isBoolean, isEqual, isNull, mapKeys, mapValues } from 'es-toolkit';
import { isEmpty, isNumber } from 'es-toolkit/compat';

import {
  BitriseYml,
  EnvironmentItemModel,
  EnvironmentItemOptionsModel,
  EnvModel,
  StepBundleModel,
  StepModel,
} from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { deepCloneSimpleObject } from '../utils/CommonUtils';
import StepBundleService from './StepBundleService';
import StepService from './StepService';

function groupStepsToStepBundle(
  parentWorkflowId: string | undefined,
  parentStepBundleId: string | undefined,
  newStepBundleId: string,
  selectedStepIndices: number[],
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If there aren't any selected steps or steps are missing in the YML, just return the YML
  let stepsInEntity;
  if (parentWorkflowId) {
    stepsInEntity = copy.workflows?.[parentWorkflowId]?.steps;
  }
  if (parentStepBundleId) {
    stepsInEntity = copy.step_bundles?.[parentStepBundleId]?.steps;
  }
  if (!selectedStepIndices.length || !stepsInEntity) {
    return copy;
  }

  // Remove step / steps from a workflow and make sure that the removed step / steps are not part of a with group or a step bundle
  const sortedIndices = selectedStepIndices.sort((a, b) => b - a);
  const removedSteps = sortedIndices
    .filter((stepIndex) => {
      if (Object.keys(stepsInEntity[stepIndex])[0].startsWith('with')) {
        return false;
      }
      return true;
    })
    .map((stepIndex) => {
      return stepsInEntity.splice(stepIndex, 1)[0];
    }) as Array<{ [key: string]: StepModel }>;

  // Create and add selected step / steps to the step bundle
  copy.step_bundles = {
    ...copy.step_bundles,
    [newStepBundleId]: { steps: removedSteps.reverse() },
  };

  // Push the created step bundle to the workflow or step_bundle, which contained the selected step / steps
  const insertPosition = sortedIndices.reverse()[0];
  stepsInEntity.splice(insertPosition, 0, {
    [StepBundleService.idToCvs(newStepBundleId)]: {},
  });
  return copy;
}

function updateStepBundle(stepBundleId: string, stepBundle: StepBundleModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  mapValues(stepBundle, (value: string, key: never) => {
    if (copy.step_bundles?.[stepBundleId]) {
      if (value) {
        copy.step_bundles[stepBundleId][key] = value as never;
      } else if (shouldRemoveField(value, yml.step_bundles?.[stepBundleId]?.[key])) {
        delete copy.step_bundles[stepBundleId][key];
      }
    }
  });

  return copy;
}

function appendStepBundleInput(bundleId: string, newInput: EnvironmentItemModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.step_bundles?.[bundleId]) {
    return copy;
  }

  copy.step_bundles[bundleId].inputs = [
    ...(copy.step_bundles[bundleId].inputs ?? []),
    StepBundleService.sanitizeInputOpts(newInput),
  ];

  return copy;
}

function deleteStepBundleInput(bundleId: string, index: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.step_bundles?.[bundleId]) {
    return copy;
  }

  copy.step_bundles?.[bundleId].inputs?.splice(index, 1);

  if (shouldRemoveField(copy.step_bundles?.[bundleId].inputs, undefined)) {
    delete copy.step_bundles?.[bundleId].inputs;
  }

  return copy;
}

function updateStepBundleInput(
  bundleId: string,
  index: number,
  newInput: EnvironmentItemModel,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.step_bundles?.[bundleId] || !copy.step_bundles?.[bundleId].inputs?.[index]) {
    return copy;
  }

  let oldInput = copy.step_bundles[bundleId].inputs[index];
  if (isEqual(oldInput, newInput)) {
    return copy;
  }

  const { opts: oo, ...oldInputKeyValue } = oldInput;
  const { opts: no, ...newInputKeyValue } = newInput;

  const [oldKey, oldValue] = Object.entries(oldInputKeyValue)[0];
  const [newKey, newValue] = Object.entries(newInputKeyValue)[0];

  if (newKey !== oldKey) {
    oldInput = mapKeys(oldInput, (_value, key) => (oldKey === key ? newKey : key));
  }

  if (newValue !== oldValue) {
    oldInput[newKey] = newValue;
  }

  if (isEmpty(oldInput.opts) && !isEmpty(newInput.opts)) {
    oldInput.opts = newInput.opts;
  }

  if (!isEmpty(oldInput.opts) && !isEmpty(newInput.opts) && oldInput.opts) {
    oldInput.opts = mapValues<EnvironmentItemOptionsModel, keyof EnvironmentItemOptionsModel, any>(
      oldInput.opts,
      (_value, key) => {
        if (newInput.opts?.[key]) {
          return newInput.opts[key];
        }
        return undefined;
      },
    );
    Object.entries(newInput.opts).forEach(([key, value]) => {
      if (oldInput.opts && !oldInput.opts[key as keyof EnvironmentItemOptionsModel]) {
        oldInput.opts[key as keyof EnvironmentItemOptionsModel] = value as any;
      }
    });
  }

  oldInput = StepBundleService.sanitizeInputOpts(oldInput);

  if (isEmpty(oldInput.opts)) {
    delete oldInput.opts;
  }

  copy.step_bundles[bundleId].inputs[index] = oldInput;

  return copy;
}

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

// UTILITY FUNCTIONS

function shouldRemoveField<T>(modified: T, original: T) {
  const modifiedIsEmpty = !isBoolean(modified) && !isNumber(modified) && !isNull(modified) && isEmpty(modified);
  const originalIsEmpty = !isBoolean(original) && !isNumber(original) && !isNull(original) && isEmpty(original);

  return modifiedIsEmpty && (!originalIsEmpty || original === undefined);
}

export default {
  getUniqueStepIds,
  getUniqueStepCvss,
  groupStepsToStepBundle,
  updateStepBundle,
  appendStepBundleInput,
  deleteStepBundleInput,
  updateStepBundleInput,
  updateStepBundleInputInstanceValue,
};
