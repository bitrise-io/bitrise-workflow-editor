import { isBoolean, isEqual, isNull, mapKeys, mapValues, omit, omitBy, pickBy } from 'es-toolkit';
import { isEmpty, isNumber, keys } from 'es-toolkit/compat';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';
import StepService from '@/core/models/StepService';
import { EnvVarYml } from './EnvVar';
import { BitriseYml, Meta } from './BitriseYml';
import { StagesYml } from './Stage';
import { TriggerMapYml } from './TriggerMap';
import { ChainedWorkflowPlacement as Placement, Workflows, WorkflowYmlObject } from './Workflow';
import { PipelinesYml, PipelineWorkflows, PipelineYmlObject } from './Pipeline';
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
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [cvs, stepYmlObject] = Object.entries(copy.workflows[workflowId].steps[stepIndex])[0];

  mapValues(newValues, (value: string, key: never) => {
    if (shouldRemoveField(value, stepYmlObject[key])) {
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

  copy.workflows[workflowId].steps[stepIndex] = mapKeys(copy.workflows[workflowId].steps[stepIndex], (_, cvs) => {
    return StepService.updateVersion(String(cvs), defaultStepLibrary, version);
  });

  return copy;
}

function updateStepInputs(workflowId: string, stepIndex: number, newInputs: StepInputVariable[], yml: BitriseYml) {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [, stepYmlObject] = Object.entries(copy.workflows?.[workflowId]?.steps?.[stepIndex])[0] as [
    string,
    StepYmlObject,
  ];

  newInputs.forEach((input) => {
    if (!stepYmlObject.inputs) {
      stepYmlObject.inputs = [];
    }

    const [key, value] = Object.entries(omit(input, ['opts']))[0];
    const inputIndexInYml = stepYmlObject.inputs.findIndex((i) => Object.keys(i).includes(key));
    const isInputExistsInTheYml = inputIndexInYml > -1;

    if (isInputExistsInTheYml) {
      const valueInYml = stepYmlObject.inputs[inputIndexInYml][key];

      if (valueInYml === null && !String(value)) {
        return;
      }

      const inputObject = StepService.toYmlInput(key, value, stepYmlObject.inputs[inputIndexInYml].opts);

      if (inputObject) {
        stepYmlObject.inputs[inputIndexInYml] = inputObject;
      } else {
        stepYmlObject.inputs.splice(inputIndexInYml, 1);
      }
    } else {
      const inputObject = StepService.toYmlInput(key, value);
      if (inputObject) {
        stepYmlObject.inputs.push(inputObject);
      }
    }
  });

  if (isEmpty(newInputs) || isEmpty(stepYmlObject.inputs)) {
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

function addStepToStepBundle(stepBundleId: string, cvs: string, to: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]) {
    return copy;
  }

  const steps = copy.step_bundles[stepBundleId].steps ?? [];
  steps.splice(to, 0, { [cvs]: {} });
  copy.step_bundles[stepBundleId].steps = steps;

  return copy;
}

function changeStepVersionInStepBundle(stepBundleId: string, stepIndex: number, version: string, yml: BitriseYml) {
  const copy = deepCloneSimpleObject(yml);
  const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.step_bundles[stepBundleId].steps[stepIndex] = mapKeys(
    copy.step_bundles[stepBundleId].steps[stepIndex],
    (_, cvs) => {
      return StepService.updateVersion(String(cvs), defaultStepLibrary, version);
    },
  );

  return copy;
}

function cloneStepInStepBundle(stepBundleId: string, stepIndex: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  const clonedIndex = stepIndex + 1;
  const clonedStep = copy.step_bundles[stepBundleId].steps[stepIndex];
  copy.step_bundles[stepBundleId].steps.splice(clonedIndex, 0, clonedStep);

  return copy;
}

function createStepBundle(stepBundleId: string, yml: BitriseYml, baseStepBundleId?: string): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  copy.step_bundles = {
    ...copy.step_bundles,
    ...{
      [stepBundleId]: baseStepBundleId ? (copy.step_bundles?.[baseStepBundleId] ?? {}) : {},
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
          return stepId !== `bundle::${stepBundleId}`;
        });

        return [workflowId, { ...workflow, steps: filteredSteps }];
      }),
    );
  }

  // Remove the whole `step_bundles` section in the YML if empty
  if (shouldRemoveField(copy.step_bundles, yml.step_bundles)) {
    delete copy.step_bundles;
  }

  return copy;
}

function deleteStepInStepBundle(stepBundleId: string, stepIndex: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.step_bundles[stepBundleId].steps.splice(stepIndex, 1);

  // If the steps are empty, remove it
  if (shouldRemoveField(copy.step_bundles[stepBundleId].steps, yml.step_bundles?.[stepBundleId]?.steps)) {
    delete copy.step_bundles[stepBundleId].steps;
  }

  return copy;
}

function groupStepsToStepBundle(
  workflowId: string,
  stepBundleId: string,
  stepIndex: number,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow or step is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]?.steps?.[stepIndex]) {
    return copy;
  }

  // Remove step from a workflow and make sure that the removed step is not part of a with group or a step bundle
  const removedSteps = copy.workflows[workflowId].steps.splice(stepIndex, 1).filter((step) => {
    const { isStep } = StepService;
    const defaultStepLibrary = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;
    const cvs = Object.keys(step)[0];
    return isStep(cvs, defaultStepLibrary);
  }) as { [x: string]: StepYmlObject }[];

  // Create and add selected step to the step bundle
  copy.step_bundles = {
    ...copy.step_bundles,
    ...{
      [stepBundleId]: { steps: removedSteps },
    },
  };

  // Push the created step bundle to the workflow, which contained the selected step / steps
  const steps = copy.workflows[workflowId].steps ?? [];
  steps.splice(stepIndex, 0, { [`bundle::${stepBundleId}`]: {} });
  copy.workflows[workflowId].steps = steps;

  return copy;
}

function moveStepInStepBundle(stepBundleId: string, stepIndex: number, to: number, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  copy.step_bundles[stepBundleId].steps.splice(to, 0, copy.step_bundles[stepBundleId].steps.splice(stepIndex, 1)[0]);

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
          renamedSteps = workflow.steps.map((step: any) => {
            const [stepId, stepDetails] = Object.entries(step)[0];
            if (stepId === `bundle::${stepBundleId}`) {
              return { [`bundle::${newStepBundleId}`]: stepDetails };
            }
            return step;
          });
        }
        return [workflowId, { ...workflow, steps: renamedSteps }];
      }),
    );
  }

  return copy;
}

function updateStepInStepBundle(
  stepBundleId: string,
  stepIndex: number,
  newValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [cvs, stepYmlObject] = Object.entries(copy.step_bundles[stepBundleId].steps[stepIndex])[0];

  mapValues(newValues, (value: string, key: never) => {
    if (shouldRemoveField(value, stepYmlObject[key])) {
      delete stepYmlObject[key];
    } else {
      stepYmlObject[key] = value as never;
    }
  });

  copy.step_bundles[stepBundleId].steps[stepIndex] = { [cvs]: stepYmlObject };

  return copy;
}

function updateStepInputsInStepBundle(
  stepBundleId: string,
  stepIndex: number,
  newInputs: StepInputVariable[],
  yml: BitriseYml,
) {
  const copy = deepCloneSimpleObject(yml);

  // If the step bundle or step is missing in the YML just return the YML
  if (!copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex]) {
    return copy;
  }

  const [, stepYmlObject] = Object.entries(copy.step_bundles?.[stepBundleId]?.steps?.[stepIndex])[0] as [
    string,
    StepYmlObject,
  ];

  newInputs.forEach((input) => {
    if (!stepYmlObject.inputs) {
      stepYmlObject.inputs = [];
    }

    const [key, value] = Object.entries(omit(input, ['opts']))[0];
    const inputIndexInYml = stepYmlObject.inputs.findIndex((i) => Object.keys(i).includes(key));
    const isInputExistsInTheYml = inputIndexInYml > -1;

    if (isInputExistsInTheYml) {
      const valueInYml = stepYmlObject.inputs[inputIndexInYml][key];

      if (valueInYml === null && !String(value)) {
        return;
      }

      const inputObject = StepService.toYmlInput(key, value, stepYmlObject.inputs[inputIndexInYml].opts);

      if (inputObject) {
        stepYmlObject.inputs[inputIndexInYml] = inputObject;
      } else {
        stepYmlObject.inputs.splice(inputIndexInYml, 1);
      }
    } else {
      const inputObject = StepService.toYmlInput(key, value);
      if (inputObject) {
        stepYmlObject.inputs.push(inputObject);
      }
    }
  });

  if (isEmpty(newInputs) || isEmpty(stepYmlObject.inputs)) {
    delete stepYmlObject.inputs;
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
    if (!copy.pipelines?.[pipelineId]?.workflows?.[parentWorkflowId]) {
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

function removeWorkflowFromPipeline(pipelineId: string, workflowId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  delete copy.pipelines[pipelineId].workflows[workflowId];
  copy.pipelines[pipelineId].workflows = deleteWorkflowFromDependsOn(workflowId, copy.pipelines[pipelineId].workflows);

  // NOTE - This is commented out until the BE validation is changed
  // if (shouldRemoveField(copy.pipelines[pipelineId].workflows, yml.pipelines?.[pipelineId]?.workflows)) {
  //   delete copy.pipelines[pipelineId].workflows;
  // }

  return copy;
}

function addPipelineWorkflowDependency(
  pipelineId: string,
  workflowId: string,
  dependencyId: string,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  if (!copy.pipelines?.[pipelineId]?.workflows?.[dependencyId]) {
    return copy;
  }

  if (workflowId === dependencyId) {
    return copy;
  }

  const workflow = copy.pipelines[pipelineId].workflows[workflowId];

  if (workflow.depends_on?.includes(dependencyId)) {
    return copy;
  }

  workflow.depends_on = [...(workflow.depends_on ?? []), dependencyId];

  return copy;
}

function removePipelineWorkflowDependency(
  pipelineId: string,
  workflowId: string,
  dependencyId: string,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.pipelines?.[pipelineId]?.workflows?.[workflowId]) {
    return copy;
  }

  const workflow = copy.pipelines[pipelineId].workflows[workflowId];

  if (workflow.depends_on) {
    workflow.depends_on = workflow.depends_on.filter((id) => id !== dependencyId);
  }

  if (shouldRemoveField(workflow.depends_on, yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.depends_on)) {
    delete workflow.depends_on;
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

function updateWorkflowMeta(workflowId: string, newValues: Required<Meta>['bitrise.io'], yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  if (copy.workflows[workflowId].meta?.['bitrise.io']) {
    const copyBitriseIoMeta = copy.workflows[workflowId].meta?.['bitrise.io'] as Required<Meta>['bitrise.io'];
    if (newValues.stack !== undefined) {
      copyBitriseIoMeta.stack = newValues.stack;
    }
    if (newValues.machine_type_id !== undefined) {
      copyBitriseIoMeta.machine_type_id = newValues.machine_type_id;
    }
    if (newValues.license_pool_id !== undefined) {
      copyBitriseIoMeta.license_pool_id = newValues.license_pool_id;
    }
    copy.workflows[workflowId].meta['bitrise.io'] = copyBitriseIoMeta;
  } else {
    copy.workflows[workflowId].meta = {
      ...copy.workflows[workflowId].meta,
      'bitrise.io': newValues,
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
    if (copy.workflows[workflowId].triggers) {
      delete copy.workflows[workflowId].triggers.enabled;
    }
  } else {
    copy.workflows[workflowId].triggers = {
      enabled: false,
      ...(copy.workflows[workflowId].triggers || {}),
    };
  }

  return copy;
}

function updatePipelineTriggers(
  pipelineID: string,
  triggers: PipelineYmlObject['triggers'],
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the pipeline is missing in the YML just return the YML
  if (!copy.pipelines?.[pipelineID]) {
    return copy;
  }

  copy.pipelines[pipelineID].triggers = triggers;

  return copy;
}

function updatePipelineTriggersEnabled(pipelineId: string, isEnabled: boolean, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the pipeline is missing in the YML just return the YML
  if (!copy.pipelines?.[pipelineId]) {
    return copy;
  }

  if (isEnabled === true) {
    if (copy.pipelines[pipelineId].triggers) {
      delete copy.pipelines[pipelineId].triggers.enabled;
    }
  } else {
    copy.pipelines[pipelineId].triggers = {
      enabled: false,
      ...(copy.pipelines[pipelineId].triggers || {}),
    };
  }

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

    stageCopy.workflows = stageCopy.workflows?.map((workflowsObj) => omit(workflowsObj, [workflowId]));
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

    // Remove workflow from `workflows` section of the pipeline
    delete pipelineCopy.workflows?.[workflowId];

    pipelineCopy.workflows = deleteWorkflowFromDependsOn(workflowId, pipelineCopy.workflows);

    pipelineCopy.workflows = deleteWorkflowVariants(workflowId, pipelineCopy.workflows);

    if (shouldRemoveField(pipelineCopy.workflows, pipeline.workflows)) {
      delete pipelineCopy.workflows;
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
  addStep,
  moveStep,
  cloneStep,
  updateStep,
  getUniqueStepIds,
  changeStepVersion,
  updateStepInputs,
  deleteStep,
  addStepToStepBundle,
  changeStepVersionInStepBundle,
  cloneStepInStepBundle,
  createStepBundle,
  deleteStepBundle,
  deleteStepInStepBundle,
  groupStepsToStepBundle,
  moveStepInStepBundle,
  renameStepBundle,
  updateStepInStepBundle,
  updateStepInputsInStepBundle,
  createWorkflow,
  renameWorkflow,
  updateWorkflow,
  deleteWorkflow,
  deleteWorkflows,
  addChainedWorkflow,
  setChainedWorkflows,
  removeChainedWorkflow,
  createPipeline,
  renamePipeline,
  updatePipeline,
  deletePipeline,
  deletePipelines,
  addWorkflowToPipeline,
  removeWorkflowFromPipeline,
  addPipelineWorkflowDependency,
  removePipelineWorkflowDependency,
  updatePipelineWorkflowConditionAbortPipelineOnFailure,
  updatePipelineWorkflowConditionShouldAlwaysRun,
  updatePipelineWorkflowConditionRunIfExpression,
  updateWorkflowMeta,
  updateTriggerMap,
  appendWorkflowEnvVar,
  updateWorkflowEnvVars,
  updateWorkflowTriggers,
  updateWorkflowTriggersEnabled,
  updatePipelineTriggers,
  updatePipelineTriggersEnabled,
  updateLicensePoolId,
};
