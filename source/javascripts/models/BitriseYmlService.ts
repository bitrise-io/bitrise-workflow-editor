import isEmpty from 'lodash/isEmpty';
import { BitriseYml } from './BitriseYml';
import PipelineService from './PipelineService';
import { Stage } from './Stage';
import StageService from './StageService';
import TriggerMapService from './TriggerMapService';
import WorkflowService from './WorkflowService';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

function deleteWorkflow(yml: BitriseYml, workflowId: string): BitriseYml {
  const copy = deepCloneSimpleObject(yml);

  if (copy.workflows) {
    // Remove workflow from `workflows` section of the YML
    delete copy.workflows[workflowId];

    // Remove workflow from other workflows `after_run` & `before_run` section
    copy.workflows = Object.fromEntries(
      Object.entries(copy.workflows).map(([id, workflow]) => {
        return [id, WorkflowService.deleteChainedWorkflowById(workflow, workflowId)];
      }),
    );

    if (isEmpty(copy.workflows)) {
      delete copy.workflows;
    }
  }

  // Remove workflows from the `stages` section of the YML
  if (copy.stages) {
    copy.stages = Object.fromEntries(
      Object.entries(copy.stages).reduce<[string, Stage][]>((stageEntries, [id, stage]) => {
        const updatedStage = StageService.deleteWorkflow(stage, workflowId);

        if (!updatedStage.workflows?.length) {
          return stageEntries;
        }

        return [...stageEntries, [id, updatedStage]];
      }, []),
    );

    if (isEmpty(copy.stages)) {
      delete copy.stages;
    }
  }

  // Remove workflows from `pipelines.stages` section of the YML
  if (copy.pipelines) {
    copy.pipelines = Object.fromEntries(
      Object.entries(copy.pipelines).reduce<[string, Stage][]>((pipelineEntries, [pipelineId, pipeline]) => {
        const updatedPipeline = PipelineService.deleteWorkflow(pipeline, workflowId);

        if (!updatedPipeline.stages?.length) {
          return pipelineEntries;
        }

        return [...pipelineEntries, [pipelineId, updatedPipeline]];
      }, []),
    );

    if (isEmpty(copy.pipelines)) {
      delete copy.pipelines;
    }
  }

  // Remove triggers what depends on the given workflow
  if (copy.trigger_map) {
    copy.trigger_map = TriggerMapService.deleteWorkflow(copy.trigger_map, workflowId);

    if (isEmpty(copy.trigger_map)) {
      delete copy.trigger_map;
    }
  }

  return copy;
}

export default {
  deleteWorkflow,
};
