import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';
import mapKeys from 'lodash/mapKeys';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import mapValues from 'lodash/mapValues';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';
import StepService from '@/core/models/StepService';
import { TargetBasedTriggers } from '@/pages/TriggersPage/components/TriggersPage/TriggersPage.utils';
import { EnvVarYml } from './EnvVar';
import { BitriseYml, Meta } from './BitriseYml';
import { StagesYml } from './Stage';
import { TriggerMapYml } from './TriggerMap';
import { ChainedWorkflowPlacement as Placement, Workflows, WorkflowYmlObject } from './Workflow';
import { PipelinesYml, PipelineYmlObject } from './Pipeline';
import { BITRISE_STEP_LIBRARY_URL, StepInputVariable, StepYmlObject } from './Step';

function addStep(workflowId: string, cvs: string, to: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  const steps = copy.workflows[workflowId].steps ?? [];
  steps.splice(to, 0, { [cvs]: {} });
  copy.workflows[workflowId].steps = steps;

  return copy;
}

function moveStep(workflowId: string, stepIndex: number, to: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.workflows[workflowId].steps.splice(to, 0, copy.workflows[workflowId].steps.splice(stepIndex, 1)[0]);

  return copy;
}

function cloneStep(workflowId: string, stepIndex: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  const clonedIndex = stepIndex + 1;
  const clonedStep = copy.workflows[workflowId].steps[stepIndex];
  copy.workflows[workflowId].steps.splice(clonedIndex, 0, clonedStep);

  return copy;
}

function updateStep(
  workflowId: string,
  stepIndex: number,
  newValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
  defaultValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [cvs, stepYmlObject] = Object.entries(copy.workflows[workflowId].steps[stepIndex])[0];

  mapValues(newValues, (value: string, key: never) => {
    if (value === defaultValues[key] || shouldRemoveField(value, stepYmlObject[key])) {
      delete stepYmlObject[key];
    } else {
      stepYmlObject[key] = value as never;
    }
  });

  copy.workflows[workflowId].steps[stepIndex] = { [cvs]: stepYmlObject };

  return copy;
}

function changeStepVersion(workflowId: string, stepIndex: number, version: string, yml: BitriseYml) {
  const copy = deepCloneSimpleObject(yml);
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.workflows[workflowId].steps[stepIndex] = mapKeys(
    copy.workflows[workflowId].steps[stepIndex],
    (_, cvs: string) => {
      return StepService.updateVersion(cvs, defaultStepLibrary, version);
    },
  );

  return copy;
}

function updateStepInputs(
  workflowId: string,
  stepIndex: number,
  newInputs: StepInputVariable[],
  defaultInputs: StepInputVariable[],
  yml: BitriseYml,
) {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [, stepYmlObject] = Object.entries(copy.workflows?.[workflowId]?.steps?.[stepIndex])[0] as [
    string,
    StepYmlObject,
  ];

  defaultInputs.forEach((input) => {
    if (!stepYmlObject.inputs) {
      stepYmlObject.inputs = [];
    }

    const [key, defaultValue] = Object.entries(omit(input, 'opts'))[0];
    const newValue = newInputs.find((i) => Object.keys(i).includes(key))?.[key];
    const inputIndexInYml = stepYmlObject.inputs.findIndex((i) => Object.keys(i).includes(key));
    const isInputExistsInTheYml = inputIndexInYml > -1;

    if (isInputExistsInTheYml) {
      const valueInYml = stepYmlObject.inputs[inputIndexInYml][key];

      if (valueInYml === null && !String(newValue)) {
        return;
      }

      const inputObject = StepService.toYmlInput(
        key,
        newValue,
        defaultValue,
        stepYmlObject.inputs[inputIndexInYml].opts,
      );

      if (inputObject) {
        stepYmlObject.inputs[inputIndexInYml] = inputObject;
      } else {
        stepYmlObject.inputs.splice(inputIndexInYml, 1);
      }
    } else {
      const inputObject = StepService.toYmlInput(key, newValue, defaultValue);
      if (inputObject) {
        stepYmlObject.inputs.push(inputObject);
      }
    }
  });

  if (isEmpty(stepYmlObject.inputs)) {
    delete stepYmlObject.inputs;
  }

  return copy;
}

function deleteStep(workflowId: string, stepIndex: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.workflows[workflowId].steps.splice(stepIndex, 1);

  // If the steps are empty, remove it
  if (shouldRemoveField(copy.workflows[workflowId].steps, yml.workflows?.[workflowId]?.steps)) {
    delete copy.workflows[workflowId].steps;
  }

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

function updateWorkflow(workflowId: string, workflow: WorkflowYmlObject, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  mapValues(workflow, (value: string, key: never) => {
    if (copy.workflows?.[workflowId]) {
      if (value) {
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

function deleteChainedWorkflow(
  chainedWorkflowIndex: number,
  parentWorkflowId: string,
  placement: Placement,
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

  copy.workflows[parentWorkflowId][placement].splice(chainedWorkflowIndex, 1);

  // If the chained placement is empty, remove it
  if (shouldRemoveField(copy.workflows[parentWorkflowId][placement], yml.workflows?.[parentWorkflowId]?.[placement])) {
    delete copy.workflows[parentWorkflowId][placement];
  }

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

function addChainedWorkflow(
  chainableWorkflowId: string,
  parentWorkflowId: string,
  placement: Placement,
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

function createPipeline(pipelineId: string, yml: BitriseYml, basePipelineId?: string): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  const emptyGraphPipeline = { workflows: {} };

  copy.pipelines = {
    ...copy.pipelines,
    [pipelineId]: basePipelineId ? (copy.pipelines?.[basePipelineId] ?? emptyGraphPipeline) : emptyGraphPipeline,
  };

  return copy;
}

function renamePipeline(pipelineId: string, newPipelineId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (copy.pipelines) {
    copy.pipelines = Object.fromEntries(
      Object.entries(copy.pipelines).map(([id, pipeline]) => {
        return [id === pipelineId ? newPipelineId : id, pipeline];
      }),
    );
  }

  if (copy.trigger_map) copy.trigger_map = renamePipelineInTriggerMap(pipelineId, newPipelineId, copy.trigger_map);

  return copy;
}

function updatePipeline(pipelineId: string, pipeline: PipelineYmlObject, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  mapValues(pipeline, (value: string, key: never) => {
    if (copy.pipelines?.[pipelineId]) {
      if (value) {
        copy.pipelines[pipelineId][key] = value as never;
      } else if (shouldRemoveField(value, yml.pipelines?.[pipelineId]?.[key])) {
        delete copy.pipelines[pipelineId][key];
      }
    }
  });

  return copy;
}

function deletePipeline(pipelineId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the pipeline is missing in the YML just return the YML
  if (!copy.pipelines?.[pipelineId]) {
    return copy;
  }

  // Remove pipeline from `pipelines` section of the YML
  delete copy.pipelines[pipelineId];

  // Remove the whole `pipelines` section in the YML if empty
  if (shouldRemoveField(copy.pipelines, yml.pipelines)) {
    delete copy.pipelines;
  }

  // Remove triggers what referencing to the pipeline
  copy.trigger_map = deletePipelineFromTriggerMap(pipelineId, copy.trigger_map);

  // Remove the whole `trigger_map` section in the YML if empty
  if (shouldRemoveField(copy.trigger_map, yml.trigger_map)) {
    delete copy.trigger_map;
  }

  return copy;
}

function deletePipelines(pipelineIds: string[], yml: BitriseYml): BitriseYml {
  let copy = deepCloneSimpleObject(yml);

  pipelineIds.forEach((pipelineId) => {
    copy = deletePipeline(pipelineId, copy);
  });

  return copy;
}

function addWorkflowToPipeline(
  pipelineId: string,
  workflowId: string,
  yml: BitriseYml,
  parentWorkflowId?: string,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]) {
    return copy;
  }

  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  if (copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  if (parentWorkflowId) {
    if (!copy.workflows?.[parentWorkflowId] || !copy.pipelines?.[pipelineId]?.workflows?.[parentWorkflowId]) {
      return copy;
    }
  }

  const workflowToAdd = parentWorkflowId ? { [workflowId]: { depends_on: [parentWorkflowId] } } : { [workflowId]: {} };

  copy.pipelines[pipelineId].workflows = {
    ...copy.pipelines[pipelineId].workflows,
    ...workflowToAdd,
  };
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

function updateStackAndMachine(workflowId: string, stack: string, machineTypeId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  if (copy.workflows[workflowId].meta?.['bitrise.io']) {
    const copyBitriseIoMeta = copy.workflows[workflowId].meta?.['bitrise.io'] as Required<Meta>['bitrise.io'];
    copyBitriseIoMeta.stack = stack;
    copyBitriseIoMeta.machine_type_id = machineTypeId;
    copy.workflows[workflowId].meta['bitrise.io'] = copyBitriseIoMeta;
  } else {
    copy.workflows[workflowId].meta = {
      ...copy.workflows[workflowId].meta,
      'bitrise.io': { stack, machine_type_id: machineTypeId },
    };
  }

  const newMeta = copy.workflows[workflowId].meta as Meta | undefined;
  const ymlMeta = yml.workflows?.[workflowId]?.meta as Meta | undefined;

  if (shouldRemoveField(newMeta?.['bitrise.io']?.stack, ymlMeta?.['bitrise.io']?.stack)) {
    delete newMeta?.['bitrise.io']?.stack;
  }

  if (shouldRemoveField(newMeta?.['bitrise.io']?.machine_type_id, ymlMeta?.['bitrise.io']?.machine_type_id)) {
    delete newMeta?.['bitrise.io']?.machine_type_id;
  }

  if (shouldRemoveField(newMeta?.['bitrise.io'], ymlMeta?.['bitrise.io'])) {
    delete newMeta?.['bitrise.io'];
  }

  if (shouldRemoveField(copy.workflows[workflowId].meta, yml.workflows?.[workflowId]?.meta)) {
    delete copy.workflows[workflowId].meta;
  }

  return copy;
}

function appendWorkflowEnvVar(workflowId: string, envVar: EnvVarYml, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].envs = [...(copy.workflows[workflowId].envs ?? []), envVar];

  return copy;
}

function updateWorkflowEnvVars(workflowId: string, envVars: EnvVarYml[], yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].envs = envVars.map((newEnvVar, i) => {
    const oldEnvVar = copy.workflows?.[workflowId]?.envs?.[i] as EnvVarYml;

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

  if (shouldRemoveField(copy.workflows[workflowId].envs, yml.workflows?.[workflowId]?.envs)) {
    delete copy.workflows[workflowId].envs;
  }

  return copy;
}

function updateTriggerMap(newTriggerMap: TriggerMapYml, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  copy.trigger_map = newTriggerMap;

  return copy;
}

function getUniqueStepIds(yml: BitriseYml) {
  const ids = new Set<string>();
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  mapValues(yml.workflows, (workflow) => {
    workflow.steps?.forEach((stepLikeObject) => {
      mapValues(stepLikeObject, (stepLike, cvsLike) => {
        if (StepService.isStep(cvsLike, defaultStepLibrary, stepLike)) {
          const { id } = StepService.parseStepCVS(cvsLike, defaultStepLibrary);
          ids.add(id);
        }

        if (
          StepService.isStepBundle(cvsLike, defaultStepLibrary, stepLike) ||
          StepService.isWithGroup(cvsLike, defaultStepLibrary, stepLike)
        ) {
          stepLike.steps?.forEach((stepObj) => {
            mapValues(stepObj, (_, cvs) => {
              const { id } = StepService.parseStepCVS(cvs, defaultStepLibrary);
              ids.add(id);
            });
          });
        }
      });
    });
  });

  return Array.from(ids);
}

function updateWorkflowTriggers(
  workflowId: string,
  triggers: WorkflowYmlObject['triggers'],
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  copy.workflows[workflowId].triggers = triggers;

  return copy;
}

function updateWorkflowTriggersEnabled(workflowId: string, isEnabled: boolean, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  if (isEnabled === true) {
    delete (copy.workflows[workflowId].triggers as TargetBasedTriggers).enabled;
  } else {
    copy.workflows[workflowId].triggers = {
      enabled: false,
      ...(copy.workflows[workflowId].triggers || {}),
    };
  }

  return copy;
}

// UTILITY FUNCTIONS

function isNotEmpty<T>(v: T) {
  return !isEmpty(v);
}

function omitEmpty<T>(o: Record<string, T>) {
  return omitBy(o, isEmpty);
}

function omitEmptyIfKeyNotExistsIn<T>(o: Record<string, T>, keys: string[]) {
  return omitBy(o, (v, k) => isEmpty(v) && !keys.includes(k));
}

function shouldRemoveField<T>(modified: T, original: T) {
  const modifiedIsEmpty = !isBoolean(modified) && !isNumber(modified) && !isNull(modified) && isEmpty(modified);
  const originalIsEmpty = !isBoolean(original) && !isNumber(original) && !isNull(original) && isEmpty(original);

  return modifiedIsEmpty && (!originalIsEmpty || original === undefined);
}

// PRIVATE FUNCTIONS

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

function renameWorkflowInStages(workflowId: string, newWorkflowId: string, stages: StagesYml): StagesYml {
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

function deleteWorkflowFromStages(workflowId: string, stages: StagesYml = {}): StagesYml {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((workflowsObj) => omit(workflowsObj, workflowId));
    stageCopy.workflows = stageCopy.workflows?.filter(isNotEmpty);

    if (shouldRemoveField(stageCopy.workflows, stage.workflows)) {
      delete stageCopy.workflows;
    }

    return stageCopy;
  });
}

function renameWorkflowInPipelines(workflowId: string, newWorkflowId: string, pipelines: PipelinesYml): PipelinesYml {
  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => {
      return renameWorkflowInStages(workflowId, newWorkflowId, stagesObj);
    });

    if (shouldRemoveField(pipelineCopy.stages, pipeline.stages)) {
      delete pipelineCopy.stages;
    }

    return pipelineCopy;
  });
}

function deleteWorkflowFromPipelines(
  workflowId: string,
  pipelines: PipelinesYml = {},
  stages: StagesYml = {},
): PipelinesYml {
  const stageIds = Object.keys(stages);

  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => deleteWorkflowFromStages(workflowId, stagesObj));
    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => omitEmptyIfKeyNotExistsIn(stagesObj, stageIds));
    pipelineCopy.stages = pipelineCopy.stages?.filter(isNotEmpty);

    if (shouldRemoveField(pipelineCopy.stages, pipeline.stages)) {
      delete pipelineCopy.stages;
    }

    return pipelineCopy;
  });
}

function renameWorkflowInTriggerMap(
  workflowId: string,
  newWorkflowId: string,
  triggerMap: TriggerMapYml,
): TriggerMapYml {
  return triggerMap.map((trigger) => {
    const triggerCopy = deepCloneSimpleObject(trigger);

    if (triggerCopy.workflow === workflowId) {
      triggerCopy.workflow = newWorkflowId;
    }

    return triggerCopy;
  });
}

function deleteWorkflowFromTriggerMap(workflowId: string, triggerMap: TriggerMapYml = []): TriggerMapYml {
  return triggerMap.filter((trigger) => trigger.workflow !== workflowId);
}

function renamePipelineInTriggerMap(
  pipelineId: string,
  newPipelineId: string,
  triggerMap: TriggerMapYml,
): TriggerMapYml {
  return triggerMap.map((trigger) => {
    const triggerCopy = deepCloneSimpleObject(trigger);

    if (triggerCopy.pipeline === pipelineId) {
      triggerCopy.pipeline = newPipelineId;
    }

    return triggerCopy;
  });
}

function deletePipelineFromTriggerMap(pipelineId: string, triggerMap: TriggerMapYml = []): TriggerMapYml {
  return triggerMap.filter((trigger) => trigger.pipeline !== pipelineId);
}

export default {
  addStep,
  moveStep,
  cloneStep,
  updateStep,
  getUniqueStepIds,
  changeStepVersion,
  updateStepInputs,
  deleteStep,
  createWorkflow,
  renameWorkflow,
  updateWorkflow,
  deleteWorkflow,
  deleteWorkflows,
  addChainedWorkflow,
  setChainedWorkflows,
  deleteChainedWorkflow,
  createPipeline,
  renamePipeline,
  updatePipeline,
  deletePipeline,
  deletePipelines,
  addWorkflowToPipeline,
  updatePipelineWorkflowConditionAbortPipelineOnFailure,
  updatePipelineWorkflowConditionShouldAlwaysRun,
  updatePipelineWorkflowConditionRunIfExpression,
  updateStackAndMachine,
  updateTriggerMap,
  appendWorkflowEnvVar,
  updateWorkflowEnvVars,
  updateWorkflowTriggers,
  updateWorkflowTriggersEnabled,
};
