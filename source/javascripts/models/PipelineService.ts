import { Pipeline } from './Pipeline';
import { Stages } from './Stage';
import StageService from './StageService';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

function deleteWorkflow(pipeline: Pipeline, workflowId: string): Pipeline {
  const copy = deepCloneSimpleObject(pipeline);

  copy.stages = copy.stages?.reduce<Stages[]>((updatedStages, stageObj) => {
    const [stageId, stage] = Object.entries(stageObj)[0];
    const updatedStage = StageService.deleteWorkflow(stage, workflowId);

    if (!updatedStage.workflows?.length) {
      return updatedStages;
    }

    return [...updatedStages, { [stageId]: updatedStage }];
  }, []);

  return copy;
}

export default {
  deleteWorkflow,
};
