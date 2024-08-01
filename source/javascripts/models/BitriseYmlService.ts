import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import { BitriseYml } from './BitriseYml';
import { Stages } from './Stage';
import { ChainedWorkflowPlacement as Placement, Workflows } from './Workflow';
import { Pipelines } from './Pipeline';
import { TriggerMap } from './TriggerMap';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

const isNotEmpty = <T>(v: T) => !isEmpty(v);
const omitEmpty = <T>(o: Record<string, T>) => omitBy(o, isEmpty);
const omitEmptyIfKeyNotExistsIn = <T>(o: Record<string, T>, keys: string[]) =>
  omitBy(o, (v, k) => isEmpty(v) && !keys.includes(k));

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
  if (isEmpty(copy.workflows)) delete copy.workflows;

  // Remove workflow from `stages` section of the YML
  copy.stages = omitEmpty(deleteWorkflowFromStages(workflowId, copy.stages));

  // Remove the whole `stages` section in the YML if empty
  if (isEmpty(copy.stages)) delete copy.stages;

  // Remove workflow from `pipelines` section of the YML
  copy.pipelines = omitEmpty(deleteWorkflowFromPipelines(workflowId, copy.pipelines, copy.stages));

  // Remove the whole `pipelines` section in the YML if empty
  if (isEmpty(copy.pipelines)) delete copy.pipelines;

  // Remove triggers what referencing to the workflow
  copy.trigger_map = deleteWorkflowFromTriggerMap(workflowId, copy.trigger_map);

  // Remove the whole `trigger_map` section in the YML if empty
  if (isEmpty(copy.trigger_map)) delete copy.trigger_map;

  return copy;
}

function deleteChainedWorkflow(
  chainedWorkflowIndex: number,
  parentWorkflowId: string,
  placement: Placement,
  yml: BitriseYml,
): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (copy.workflows?.[parentWorkflowId]?.[placement]?.[chainedWorkflowIndex]) {
    copy.workflows[parentWorkflowId][placement].splice(chainedWorkflowIndex, 1);
    if (!copy.workflows[parentWorkflowId][placement].length) delete copy.workflows[parentWorkflowId][placement];
  }

  return copy;
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

function deleteWorkflowFromStages(workflowId: string, stages: Stages = {}): Stages {
  return mapValues(stages, (stage) => {
    const stageCopy = deepCloneSimpleObject(stage);

    stageCopy.workflows = stageCopy.workflows?.map((w) => omit(w, workflowId)).filter(isNotEmpty);
    if (isEmpty(stageCopy.workflows)) delete stageCopy.workflows;

    return stageCopy;
  });
}

function deleteWorkflowFromPipelines(workflowId: string, pipelines: Pipelines = {}, stages: Stages = {}): Pipelines {
  const stageIds = Object.keys(stages);

  return mapValues(pipelines, (pipeline) => {
    const pipelineCopy = deepCloneSimpleObject(pipeline);

    pipelineCopy.stages = pipelineCopy.stages?.map((s) => deleteWorkflowFromStages(workflowId, s));
    pipelineCopy.stages = pipelineCopy.stages?.map((s) => omitEmptyIfKeyNotExistsIn(s, stageIds)).filter(isNotEmpty);

    if (isEmpty(pipelineCopy.stages)) delete pipelineCopy.stages;

    return pipelineCopy;
  });
}

function deleteWorkflowFromTriggerMap(workflowId: string, triggerMap: TriggerMap = []): TriggerMap {
  return triggerMap.filter((trigger) => trigger.workflow !== workflowId);
}

export default {
  deleteWorkflow,
  deleteChainedWorkflow,
};
