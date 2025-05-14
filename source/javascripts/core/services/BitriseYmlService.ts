import { isBoolean, isEqual, isNull, mapKeys, mapValues, omit, omitBy, pickBy } from 'es-toolkit';
import { isEmpty, isNumber, keys } from 'es-toolkit/compat';

import {
  BitriseYml,
  EnvironmentItemModel,
  EnvironmentItemOptionsModel,
  EnvModel,
  Meta,
  Pipelines,
  PipelineWorkflows,
  Stages,
  StepBundleModel,
  StepListItemModel,
  StepModel,
  TriggerMapItemModel,
  TriggersModel,
  WorkflowModel,
  Workflows,
} from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { ChainedWorkflowPlacement as Placement } from '../models/Workflow';
import { deepCloneSimpleObject } from '../utils/CommonUtils';
import GraphPipelineWorkflowService from './GraphPipelineWorkflowService';
import StepBundleService from './StepBundleService';
import StepService from './StepService';

function createStepBundle(
  stepBundleId: string,
  yml: BitriseYml,
  baseStepBundleId?: string,
  baseWorkflowId?: string,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  let baseContent: WorkflowModel & { inputs?: EnvModel } = {};

  if (baseStepBundleId) {
    baseContent = deepCloneSimpleObject(copy.step_bundles?.[baseStepBundleId] ?? {});
  }

  if (baseWorkflowId) {
    baseContent = deepCloneSimpleObject(copy.workflows?.[baseWorkflowId] ?? {});
    if (baseContent.before_run) {
      delete baseContent.before_run;
    }
    if (baseContent.after_run) {
      delete baseContent.after_run;
    }
    if (baseContent.meta) {
      delete baseContent.meta;
    }
    if (baseContent.triggers) {
      delete baseContent.triggers;
    }
    if (baseContent.envs) {
      baseContent.inputs = baseContent.envs;
      delete baseContent.envs;
    }
  }

  copy.step_bundles = {
    ...copy.step_bundles,
    ...{
      [stepBundleId]: baseContent,
    },
  };

  return copy;
}

function deleteStepBundle(stepBundleId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);
  // If the step bundle is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]) {
    return copy;
  }

  // Remove step bundle from `step_bundles` section of the YML
  delete copy.step_bundles[stepBundleId];

  // Remove the selected step bundle from `workflows` section of the YML
  if (copy.workflows) {
    copy.workflows = Object.fromEntries(
      Object.entries(copy.workflows).map(([workflowId, workflow]) => {
        const filteredSteps = workflow.steps?.filter((step) => {
          const [stepId] = Object.keys(step);
          return stepId !== StepBundleService.idToCvs(stepBundleId);
        });
        return [workflowId, { ...workflow, steps: filteredSteps }];
      }),
    );
  }

  if (copy.step_bundles) {
    Object.entries(copy.step_bundles).forEach(([id, bundle]) => {
      const filteredSteps = bundle.steps?.filter((step) => {
        const [stepId] = Object.keys(step);
        return stepId !== StepBundleService.idToCvs(stepBundleId);
      });
      // Remove `steps` field if empty
      if (copy.step_bundles?.[id]) {
        if (filteredSteps?.length) {
          copy.step_bundles[id].steps = filteredSteps;
        } else {
          delete copy.step_bundles[id].steps;
        }
      }
    });
  }

  // Remove the whole `step_bundles` section in the YML if empty
  if (shouldRemoveField(copy.step_bundles, yml.step_bundles)) {
    delete copy.step_bundles;
  }

  return copy;
}

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

function renameStepBundle(stepBundleId: string, newStepBundleId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (copy.step_bundles) {
    copy.step_bundles = Object.fromEntries(
      Object.entries(copy.step_bundles).map(([id, stepBundle]) => {
        return [id === stepBundleId ? newStepBundleId : id, stepBundle];
      }),
    );
  }

  if (copy.workflows) {
    copy.workflows = Object.fromEntries(
      Object.entries(copy.workflows).map(([workflowId, workflow]) => {
        let renamedSteps = workflow.steps;
        if (workflow.steps) {
          renamedSteps = workflow.steps.map((step: StepListItemModel) => {
            const [stepId, stepDetails] = Object.entries(step)[0];
            if (stepId === StepBundleService.idToCvs(stepBundleId)) {
              return {
                [StepBundleService.idToCvs(newStepBundleId)]: stepDetails,
              };
            }
            return step;
          });
        }
        return [workflowId, { ...workflow, steps: renamedSteps }];
      }),
    );
  }

  if (copy.step_bundles) {
    Object.entries(copy.step_bundles).forEach(([id, bundle]) => {
      const renamedSteps = bundle.steps?.map((step) => {
        const [stepId, stepDetails] = Object.entries(step)[0];
        if (stepId === StepBundleService.idToCvs(stepBundleId)) {
          return { [StepBundleService.idToCvs(newStepBundleId)]: stepDetails };
        }
        return step;
      });
      if (copy.step_bundles?.[id]) {
        copy.step_bundles[id].steps = renamedSteps;
      }
    });
  }

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

function createWorkflow(workflowId: string, yml: BitriseYml, baseWorkflowId?: string): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  copy.workflows = {
    ...copy.workflows,
    ...{
      [workflowId]: baseWorkflowId ? (copy.workflows?.[baseWorkflowId] ?? {}) : {},
    },
  };

  return copy;
}

function renameWorkflow(workflowId: string, newWorkflowId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (copy.workflows) {
    copy.workflows = Object.fromEntries(
      Object.entries(copy.workflows).map(([id, workflow]) => {
        return [id === workflowId ? newWorkflowId : id, workflow];
      }),
    );

    copy.workflows = renameWorkflowInChains(workflowId, newWorkflowId, copy.workflows);
  }

  if (copy.stages) copy.stages = renameWorkflowInStages(workflowId, newWorkflowId, copy.stages);
  if (copy.pipelines) copy.pipelines = renameWorkflowInPipelines(workflowId, newWorkflowId, copy.pipelines);
  if (copy.trigger_map) copy.trigger_map = renameWorkflowInTriggerMap(workflowId, newWorkflowId, copy.trigger_map);

  return copy;
}

function updateWorkflow(workflowId: string, workflow: WorkflowModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  mapValues(workflow, (value: string | number, key: never) => {
    if (copy.workflows?.[workflowId]) {
      if (value || (value === 0 && key === 'priority')) {
        copy.workflows[workflowId][key] = value as never;
      } else if (shouldRemoveField(value, yml.workflows?.[workflowId]?.[key])) {
        delete copy.workflows[workflowId][key];
      }
    }
  });

  return copy;
}

function deleteWorkflow(workflowId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  // Remove workflow from `workflows` section of the YML
  delete copy.workflows[workflowId];

  // Remove workflow from other workflow's chains (before_run, after_run)
  copy.workflows = deleteWorkflowFromChains(workflowId, copy.workflows);

  // Remove the whole `workflows` section in the YML if empty
  if (shouldRemoveField(copy.workflows, yml.workflows)) {
    delete copy.workflows;
  }

  // Remove workflow from `stages` section of the YML
  copy.stages = omitEmpty(deleteWorkflowFromStages(workflowId, copy.stages));

  // Remove the whole `stages` section in the YML if empty
  if (shouldRemoveField(copy.stages, yml.stages)) {
    delete copy.stages;
  }

  // Remove workflow from `pipelines` section of the YML
  copy.pipelines = omitEmpty(deleteWorkflowFromPipelines(workflowId, copy.pipelines, copy.stages));

  // Remove the whole `pipelines` section in the YML if empty
  if (shouldRemoveField(copy.pipelines, yml.pipelines)) {
    delete copy.pipelines;
  }

  // Remove triggers what referencing to the workflow
  copy.trigger_map = deleteWorkflowFromTriggerMap(workflowId, copy.trigger_map);

  // Remove the whole `trigger_map` section in the YML if empty
  if (shouldRemoveField(copy.trigger_map, yml.trigger_map)) {
    delete copy.trigger_map;
  }

  return copy;
}

function deleteWorkflows(workflowIds: string[], yml: BitriseYml): BitriseYml {
  let copy = deepCloneSimpleObject(yml);

  workflowIds.forEach((workflowId) => {
    copy = deleteWorkflow(workflowId, copy);
  });

  return copy;
}

function addChainedWorkflow(
  parentWorkflowId: string,
  placement: Placement,
  chainableWorkflowId: string,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the parent workflow or chainable workflow is missing in the YML just return the YML
  if (!copy.workflows?.[parentWorkflowId] || !copy.workflows?.[chainableWorkflowId]) {
    return copy;
  }

  // If the placement is not valid, return the YML
  if (!['after_run', 'before_run'].includes(placement)) {
    return copy;
  }

  copy.workflows[parentWorkflowId][placement] = [
    ...(copy.workflows[parentWorkflowId][placement] ?? []),
    chainableWorkflowId,
  ];

  return copy;
}

function setChainedWorkflows(
  workflowId: string,
  placement: Placement,
  chainedWorkflowIds: string[],
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  // If the placement is not valid, return the YML
  if (!['before_run', 'after_run'].includes(placement)) {
    return copy;
  }

  // Set the chained workflows
  copy.workflows[workflowId][placement] = chainedWorkflowIds;

  // If the chained placement is empty, remove it
  if (shouldRemoveField(copy.workflows[workflowId][placement], yml.workflows?.[workflowId]?.[placement])) {
    delete copy.workflows[workflowId][placement];
  }

  return copy;
}

function removeChainedWorkflow(
  parentWorkflowId: string,
  placement: Placement,
  chainedWorkflowId: string,
  chainedWorkflowIndex: number,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the parent workflow or chained placement is missing in the YML just return the YML
  if (!copy.workflows?.[parentWorkflowId]?.[placement]) {
    return copy;
  }

  // If the placement is not valid, return the YML
  if (!['before_run', 'after_run'].includes(placement)) {
    return copy;
  }

  if (
    !copy.workflows[parentWorkflowId][placement].includes(chainedWorkflowId) ||
    copy.workflows[parentWorkflowId][placement][chainedWorkflowIndex] !== chainedWorkflowId
  ) {
    return copy;
  }

  copy.workflows[parentWorkflowId][placement].splice(chainedWorkflowIndex, 1);

  // If the chained placement is empty, remove it
  if (shouldRemoveField(copy.workflows[parentWorkflowId][placement], yml.workflows?.[parentWorkflowId]?.[placement])) {
    delete copy.workflows[parentWorkflowId][placement];
  }

  return copy;
}

function updatePipelineWorkflowConditionAbortPipelineOnFailure(
  pipelineId: string,
  workflowId: string,
  abortPipelineOnFailureEnabled: boolean,
  yml: BitriseYml,
) {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  if (abortPipelineOnFailureEnabled) {
    copy.pipelines[pipelineId].workflows[workflowId].abort_on_fail = true;
  } else {
    delete copy.pipelines[pipelineId].workflows[workflowId].abort_on_fail;
  }

  return copy;
}

function updatePipelineWorkflowConditionShouldAlwaysRun(
  pipelineId: string,
  workflowId: string,
  shouldAlwaysRun: string,
  yml: BitriseYml,
) {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  if (shouldAlwaysRun === 'workflow') {
    copy.pipelines[pipelineId].workflows[workflowId].should_always_run = 'workflow';
  } else {
    delete copy.pipelines[pipelineId].workflows[workflowId].should_always_run;
  }

  return copy;
}

function updatePipelineWorkflowConditionRunIfExpression(
  pipelineId: string,
  workflowId: string,
  runIfExpression: string,
  yml: BitriseYml,
) {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  if (runIfExpression !== '') {
    const runIf = { expression: runIfExpression };
    copy.pipelines[pipelineId].workflows[workflowId].run_if = runIf;
  } else {
    delete copy.pipelines[pipelineId].workflows[workflowId].run_if;
  }

  return copy;
}

function updatePipelineWorkflowParallel(pipelineId: string, workflowId: string, parallel: string, yml: BitriseYml) {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  const typedParallel = GraphPipelineWorkflowService.asIntegerIfPossible(parallel);

  if (!typedParallel) {
    delete copy.pipelines[pipelineId].workflows[workflowId].parallel;
  } else {
    copy.pipelines[pipelineId].workflows[workflowId].parallel = typedParallel;
  }

  return copy;
}

function appendWorkflowEnvVar(workflowId: string, envVar: EnvironmentItemModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].envs = [...(copy.workflows[workflowId].envs ?? []), envVar];

  return copy;
}

function appendProjectEnvVar(envVar: EnvironmentItemModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.app) {
    copy.app = {};
  }

  if (!copy.app.envs) {
    copy.app.envs = [];
  }

  copy.app.envs = [...copy.app.envs, envVar];

  return copy;
}

function updateProjectEnvVars(envVars: EnvModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.app) {
    copy.app = {};
  }

  copy.app.envs = updateEnvVars(copy.app.envs, envVars);

  if (shouldRemoveField(copy.app.envs, yml.app?.envs)) {
    delete copy.app.envs;
  }

  return copy;
}

function updateWorkflowEnvVars(workflowId: string, envVars: EnvModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].envs = updateEnvVars(copy.workflows[workflowId].envs, envVars);

  if (shouldRemoveField(copy.workflows[workflowId].envs, yml.workflows?.[workflowId]?.envs)) {
    delete copy.workflows[workflowId].envs;
  }

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

function updateTriggerMap(newTriggerMap: TriggerMapItemModel[], yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (newTriggerMap.length) {
    copy.trigger_map = newTriggerMap;
  } else {
    delete copy.trigger_map;
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

function updateWorkflowTriggers(workflowId: string, triggers: TriggersModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].triggers = triggers;

  return copy;
}

function updatePipelineTriggers(pipelineID: string, triggers: TriggersModel, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the pipeline is missing in the YML just return the YML
  if (!copy.pipelines?.[pipelineID]) {
    return copy;
  }

  copy.pipelines[pipelineID].triggers = triggers;

  return copy;
}

// UTILITY FUNCTIONS

function isNotEmpty<T>(v: T) {
  return !isEmpty(v);
}

function omitEmpty<T>(o: Record<string, T>) {
  return omitBy(o, isEmpty) as Record<string, T>;
}

function omitEmptyIfKeyNotExistsIn<T>(o: Record<string, T>, propKeys: string[]) {
  return omitBy(o, (v, k) => isEmpty(v) && !propKeys.includes(k)) as Record<string, T>;
}

function shouldRemoveField<T>(modified: T, original: T) {
  const modifiedIsEmpty = !isBoolean(modified) && !isNumber(modified) && !isNull(modified) && isEmpty(modified);
  const originalIsEmpty = !isBoolean(original) && !isNumber(original) && !isNull(original) && isEmpty(original);

  return modifiedIsEmpty && (!originalIsEmpty || original === undefined);
}

// PRIVATE FUNCTIONS

function updateEnvVars(oldEnvVars?: EnvModel, newEnvVars?: EnvModel) {
  return newEnvVars?.map((newEnvVar, i) => {
    const oldEnvVar = oldEnvVars?.[i];

    if (!oldEnvVar) {
      return newEnvVar;
    }

    const { opts: oo, ...oldEnvVarKeyValue } = oldEnvVar;
    const { opts: no, ...newEnvVarKeyValue } = newEnvVar;

    if (!isEqual(oldEnvVarKeyValue, newEnvVarKeyValue)) {
      return newEnvVar;
    }

    if (newEnvVar.opts?.is_expand === undefined) {
      delete oldEnvVar.opts;
    } else {
      oldEnvVar.opts = { is_expand: newEnvVar.opts.is_expand };
    }

    return oldEnvVar;
  });
}

function renameWorkflowInChains(workflowId: string, newWorkflowId: string, workflows: Workflows): Workflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.after_run = workflowCopy.after_run?.map((id) => (id === workflowId ? newWorkflowId : id));
    workflowCopy.before_run = workflowCopy.before_run?.map((id) => (id === workflowId ? newWorkflowId : id));

    if (shouldRemoveField(workflowCopy.after_run, workflow.after_run)) {
      delete workflowCopy.after_run;
    }

    if (shouldRemoveField(workflowCopy.before_run, workflow.before_run)) {
      delete workflowCopy.before_run;
    }

    return workflowCopy;
  });
}

function renameWorkflowInDependsOn(
  workflowId: string,
  newWorkflowId: string,
  workflows: PipelineWorkflows,
): PipelineWorkflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.depends_on = workflowCopy.depends_on?.map((id: string) => (id === workflowId ? newWorkflowId : id));

    if (shouldRemoveField(workflowCopy.depends_on, workflow.depends_on)) {
      delete workflowCopy.depends_on;
    }

    return workflowCopy;
  });
}

function renameWorkflowInUses(
  workflowId: string,
  newWorkflowId: string,
  workflows: PipelineWorkflows,
): PipelineWorkflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    if (workflowCopy.uses === workflowId) {
      workflowCopy.uses = newWorkflowId;
    }

    return workflowCopy;
  });
}

function deleteWorkflowFromChains(workflowId: string, workflows: Workflows = {}): Workflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.after_run = workflowCopy.after_run?.filter((id) => id !== workflowId);
    workflowCopy.before_run = workflowCopy.before_run?.filter((id) => id !== workflowId);

    if (shouldRemoveField(workflowCopy.after_run, workflow.after_run)) {
      delete workflowCopy.after_run;
    }

    if (shouldRemoveField(workflowCopy.before_run, workflow.before_run)) {
      delete workflowCopy.before_run;
    }

    return workflowCopy;
  });
}

function deleteWorkflowFromDependsOn(workflowId: string, workflows: PipelineWorkflows = {}): PipelineWorkflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.depends_on = workflowCopy.depends_on?.filter((id) => id !== workflowId);

    if (shouldRemoveField(workflowCopy.depends_on, workflow.depends_on)) {
      delete workflowCopy.depends_on;
    }

    return workflowCopy;
  });
}

function deleteWorkflowVariants(workflowId: string, workflows: PipelineWorkflows = {}): PipelineWorkflows {
  const variantKeys = keys(pickBy(workflows, (workflow) => Boolean(workflow?.uses?.includes(workflowId))));

  let result = omit(workflows, variantKeys);
  variantKeys.forEach((key) => {
    result = deleteWorkflowFromDependsOn(key, result);
  });

  return result;
}

function renameWorkflowInStages(workflowId: string, newWorkflowId: string, stages: Stages): Stages {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((workflowObj) => {
      return Object.fromEntries(
        Object.entries(workflowObj).map(([id, workflow]) => {
          return [id === workflowId ? newWorkflowId : id, workflow];
        }),
      );
    });

    if (shouldRemoveField(stageCopy.workflows, stage.workflows)) {
      delete stageCopy.workflows;
    }

    return stageCopy;
  });
}

function deleteWorkflowFromStages(workflowId: string, stages: Stages = {}): Stages {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((workflowsObj) => omit(workflowsObj, [workflowId]));
    stageCopy.workflows = stageCopy.workflows?.filter(isNotEmpty);

    if (shouldRemoveField(stageCopy.workflows, stage.workflows)) {
      delete stageCopy.workflows;
    }

    return stageCopy;
  });
}

function renameWorkflowInPipelines(workflowId: string, newWorkflowId: string, pipelines: Pipelines): Pipelines {
  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => {
      return renameWorkflowInStages(workflowId, newWorkflowId, stagesObj);
    });

    if (shouldRemoveField(pipelineCopy.stages, pipeline.stages)) {
      delete pipelineCopy.stages;
    }

    pipelineCopy.workflows = Object.fromEntries(
      Object.entries(pipelineCopy.workflows ?? {}).map(([id, workflow]) => {
        return [id === workflowId ? newWorkflowId : id, workflow];
      }),
    );

    pipelineCopy.workflows = renameWorkflowInUses(workflowId, newWorkflowId, pipelineCopy.workflows);
    pipelineCopy.workflows = renameWorkflowInDependsOn(workflowId, newWorkflowId, pipelineCopy.workflows);

    if (shouldRemoveField(pipelineCopy.workflows, pipeline.workflows)) {
      delete pipelineCopy.workflows;
    }

    return pipelineCopy;
  });
}

function deleteWorkflowFromPipelines(workflowId: string, pipelines: Pipelines = {}, stages: Stages = {}): Pipelines {
  const stageIds = Object.keys(stages);

  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => deleteWorkflowFromStages(workflowId, stagesObj));
    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => omitEmptyIfKeyNotExistsIn(stagesObj, stageIds));
    pipelineCopy.stages = pipelineCopy.stages?.filter(isNotEmpty);

    if (shouldRemoveField(pipelineCopy.stages, pipeline.stages)) {
      delete pipelineCopy.stages;
    }

    // Remove workflow from `workflows` section of the pipeline
    if (pipelineCopy.workflows) {
      delete pipelineCopy.workflows?.[workflowId];
      pipelineCopy.workflows = deleteWorkflowFromDependsOn(workflowId, pipelineCopy.workflows);
      pipelineCopy.workflows = deleteWorkflowVariants(workflowId, pipelineCopy.workflows);

      // NOTE: We don't remove the whole `workflows` section in the pipeline if empty
      //       because it can be detected as staged pipeline if the `workflows` section is missing
    }

    return pipelineCopy;
  });
}

function renameWorkflowInTriggerMap(
  workflowId: string,
  newWorkflowId: string,
  triggerMap: TriggerMapItemModel[],
): TriggerMapItemModel[] {
  return triggerMap.map((trigger) => {
    const triggerCopy = deepCloneSimpleObject(trigger);

    if (triggerCopy.workflow === workflowId) {
      triggerCopy.workflow = newWorkflowId;
    }

    return triggerCopy;
  });
}

function deleteWorkflowFromTriggerMap(
  workflowId: string,
  triggerMap: TriggerMapItemModel[] = [],
): TriggerMapItemModel[] {
  return triggerMap.filter((trigger) => trigger.workflow !== workflowId);
}

function updateLicensePoolId(workflowId: string, licensePoolId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  if (copy.workflows[workflowId].meta?.['bitrise.io']) {
    const copyBitriseIoMeta = copy.workflows[workflowId].meta?.['bitrise.io'] as Required<Meta>['bitrise.io'];
    copyBitriseIoMeta.license_pool_id = licensePoolId;
    copy.workflows[workflowId].meta['bitrise.io'] = copyBitriseIoMeta;
  } else {
    copy.workflows[workflowId].meta = {
      ...copy.workflows[workflowId].meta,
      'bitrise.io': { license_pool_id: licensePoolId },
    };
  }

  const newMeta = copy.workflows[workflowId].meta as Meta | undefined;
  const ymlMeta = yml.workflows?.[workflowId]?.meta as Meta | undefined;

  if (shouldRemoveField(newMeta?.['bitrise.io']?.license_pool_id, ymlMeta?.['bitrise.io']?.license_pool_id)) {
    delete newMeta?.['bitrise.io']?.license_pool_id;
  }

  if (shouldRemoveField(newMeta?.['bitrise.io'], ymlMeta?.['bitrise.io'])) {
    delete newMeta?.['bitrise.io'];
  }

  if (shouldRemoveField(copy.workflows[workflowId].meta, yml.workflows?.[workflowId]?.meta)) {
    delete copy.workflows[workflowId].meta;
  }

  return copy;
}

export default {
  getUniqueStepIds,
  getUniqueStepCvss,
  createStepBundle,
  deleteStepBundle,
  groupStepsToStepBundle,
  renameStepBundle,
  updateStepBundle,
  createWorkflow,
  renameWorkflow,
  updateWorkflow,
  deleteWorkflow,
  deleteWorkflows,
  addChainedWorkflow,
  setChainedWorkflows,
  removeChainedWorkflow,
  updatePipelineWorkflowConditionAbortPipelineOnFailure,
  updatePipelineWorkflowConditionShouldAlwaysRun,
  updatePipelineWorkflowConditionRunIfExpression,
  updatePipelineWorkflowParallel,
  updateTriggerMap,
  appendWorkflowEnvVar,
  appendProjectEnvVar,
  updateProjectEnvVars,
  updateWorkflowEnvVars,
  updateWorkflowTriggers,
  updatePipelineTriggers,
  updateLicensePoolId,
  appendStepBundleInput,
  deleteStepBundleInput,
  updateStepBundleInput,
  updateStepBundleInputInstanceValue,
};
