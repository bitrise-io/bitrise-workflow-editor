import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PipelinesStages, Stage } from '@/core/models/Stage';
import usePipelineSelector from './usePipelineSelector';

const usePipelineStages = (): Stage[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineStages: PipelinesStages = yml.pipelines?.[selectedPipeline].stages ?? [];

    return pipelineStages.map((pipelineStageObj) => {
      const stageId = Object.keys(pipelineStageObj)[0];
      const stage = Object.values(pipelineStageObj)[0];
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { abort_on_fail, should_always_run } = stage;

      return {
        id: stageId,
        userValues: merge({}, yml.stages?.[stageId], {
          abort_on_fail,
          should_always_run,
        }),
      };
    });
  });
};

export default usePipelineStages;
