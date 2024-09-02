import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';
import { BitriseYml, Meta } from './BitriseYml';
import { Stages } from './Stage';
import { ChainedWorkflowPlacement as Placement, Workflows } from './Workflow';
import { Pipelines } from './Pipeline';
import { TriggerMap } from './TriggerMap';

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
  if (copy.workflows[workflowId][placement]) {
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

function deleteWorkflowFromStages(workflowId: string, stages: Stages = {}): Stages {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((workflowsObj) => omit(workflowsObj, workflowId));
    stageCopy.workflows = stageCopy.workflows?.filter(isNotEmpty);

    if (isEmpty(stageCopy.workflows)) delete stageCopy.workflows;

    return stageCopy;
  });
}

function deleteWorkflowFromPipelines(workflowId: string, pipelines: Pipelines = {}, stages: Stages = {}): Pipelines {
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

function deleteWorkflowFromTriggerMap(workflowId: string, triggerMap: TriggerMap = []): TriggerMap {
  return triggerMap.filter((trigger) => trigger.workflow !== workflowId);
}

export default {
  addStep,
  moveStep,
  createWorkflow,
  deleteWorkflow,
  addChainedWorkflow,
  setChainedWorkflows,
  deleteChainedWorkflow,
  updateStackAndMachine,
};
