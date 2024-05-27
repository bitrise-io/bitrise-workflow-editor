import merge from 'lodash/merge';
import { Pipeline, Stages } from '../PipelinesPage.types';

const usePipelineStages = (pipeline?: Pipeline, stages?: Stages): Stages => {
  if (!pipeline) {
    return {};
  }

  const pipelineStages = pipeline.stages ?? [];

  return Object.fromEntries(
    pipelineStages.map((pipelineStageObj) => {
      const id = Object.keys(pipelineStageObj)[0];
      const pipelineStage = Object.values(pipelineStageObj)[0];

      return [id, merge(stages?.[id], pipelineStage)];
    }),
  );
};

export default usePipelineStages;
