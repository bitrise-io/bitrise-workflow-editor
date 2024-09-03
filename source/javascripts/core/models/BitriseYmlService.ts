import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';
import { EnvVarYml } from './EnvVar';
import { BitriseYml, Meta } from './BitriseYml';
import { StagesYml } from './Stage';
import { TriggerMapYml } from './TriggerMap';
import { ChainedWorkflowPlacement as Placement, Workflows, WorkflowYmlObject } from './Workflow';
import { PipelinesYml } from './Pipeline';

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

function updateWorkflow(workflowId: string, workflow: WorkflowYmlObject, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  mapValues(workflow, (value: string, key: never) => {
    if (copy.workflows?.[workflowId]) {
      if (value) {
        copy.workflows[workflowId][key] = value as never;
      } else {
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
  if (isEmpty(copy.workflows)) {
    delete copy.workflows;
  }

  // Remove workflow from `stages` section of the YML
  copy.stages = omitEmpty(deleteWorkflowFromStages(workflowId, copy.stages));

  // Remove the whole `stages` section in the YML if empty
  if (isEmpty(copy.stages)) {
    delete copy.stages;
  }

  // Remove workflow from `pipelines` section of the YML
  copy.pipelines = omitEmpty(deleteWorkflowFromPipelines(workflowId, copy.pipelines, copy.stages));

  // Remove the whole `pipelines` section in the YML if empty
  if (isEmpty(copy.pipelines)) {
    delete copy.pipelines;
  }

  // Remove triggers what referencing to the workflow
  copy.trigger_map = deleteWorkflowFromTriggerMap(workflowId, copy.trigger_map);

  // Remove the whole `trigger_map` section in the YML if empty
  if (isEmpty(copy.trigger_map)) {
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
  if (isEmpty(copy.workflows[parentWorkflowId][placement])) {
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
  if (isEmpty(copy.workflows[workflowId][placement])) {
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

function updateStackAndMachine(workflowId: string, stack: string, machineTypeId: string, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  // If the workflow is missing in the YML just return the YML
  if (!copy.workflows?.[workflowId]) {
    return copy;
  }

  // If both stack and machineTypeID are missing, remove the bitrise.io meta overrides
  if (!stack && !machineTypeId) {
    copy.workflows[workflowId].meta = omit(copy.workflows[workflowId].meta, 'bitrise.io');

    // If the meta is empty, remove it
    if (isEmpty(copy.workflows[workflowId].meta)) {
      delete copy.workflows[workflowId].meta;
    }

    return copy;
  }

  const newBitriseIO: Meta['bitrise.io'] = {};
  if (stack) {
    newBitriseIO.stack = stack;
  }

  if (machineTypeId) {
    newBitriseIO.machine_type_id = machineTypeId;
  }

  copy.workflows[workflowId].meta = {
    ...(copy.workflows[workflowId].meta ?? {}),
    'bitrise.io': newBitriseIO,
  };

  return copy;
}

function updateWorkflowEnvVar(workflowId: string, index: number, envVar: EnvVarYml, yml: BitriseYml): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (!copy.workflows?.[workflowId]?.envs?.[index]) {
    return copy;
  }

  copy.workflows[workflowId].envs[index] = envVar;

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

// PRIVATE FUNCTIONS

function renameWorkflowInChains(workflowId: string, newWorkflowId: string, workflows: Workflows): Workflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.after_run = workflowCopy.after_run?.map((id) => (id === workflowId ? newWorkflowId : id));
    workflowCopy.before_run = workflowCopy.before_run?.map((id) => (id === workflowId ? newWorkflowId : id));

    if (isEmpty(workflowCopy.after_run)) delete workflowCopy.after_run;
    if (isEmpty(workflowCopy.before_run)) delete workflowCopy.before_run;

    return workflowCopy;
  });
}

function deleteWorkflowFromChains(workflowId: string, workflows: Workflows = {}): Workflows {
  return mapValues(workflows, (workflow) => {
    const workflowCopy = deepCloneSimpleObject(workflow);

    workflowCopy.after_run = workflowCopy.after_run?.filter((id) => id !== workflowId);
    workflowCopy.before_run = workflowCopy.before_run?.filter((id) => id !== workflowId);

    if (isEmpty(workflowCopy.after_run)) delete workflowCopy.after_run;
    if (isEmpty(workflowCopy.before_run)) delete workflowCopy.before_run;

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

    if (isEmpty(stageCopy.workflows)) delete stageCopy.workflows;

    return stageCopy;
  });
}

function deleteWorkflowFromStages(workflowId: string, stages: StagesYml = {}): StagesYml {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((workflowsObj) => omit(workflowsObj, workflowId));
    stageCopy.workflows = stageCopy.workflows?.filter(isNotEmpty);

    if (isEmpty(stageCopy.workflows)) delete stageCopy.workflows;

    return stageCopy;
  });
}

function renameWorkflowInPipelines(workflowId: string, newWorkflowId: string, pipelines: PipelinesYml): PipelinesYml {
  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((stagesObj) => {
      return renameWorkflowInStages(workflowId, newWorkflowId, stagesObj);
    });

    if (isEmpty(pipelineCopy.stages)) delete pipelineCopy.stages;

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

    if (isEmpty(pipelineCopy.stages)) delete pipelineCopy.stages;

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

export default {
  addStep,
  moveStep,
  renameWorkflow,
  updateWorkflow,
  createWorkflow,
  deleteWorkflow,
  deleteWorkflows,
  addChainedWorkflow,
  setChainedWorkflows,
  deleteChainedWorkflow,
  updateStackAndMachine,
  appendWorkflowEnvVar,
  updateWorkflowEnvVar,
};
