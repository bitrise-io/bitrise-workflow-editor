import { toMerged } from 'es-toolkit';

import { PipelineStages } from '@/core/models/BitriseYml';
import { Stage } from '@/core/models/Stage';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';

const usePipelineStages = (): Stage[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineStages: PipelineStages = yml.pipelines?.[selectedPipeline].stages ?? [];

    return pipelineStages.map((pipelineStageObj) => {
      const stageId = Object.keys(pipelineStageObj)[0];
      const stage = Object.values(pipelineStageObj)[0];
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { abort_on_fail, should_always_run } = stage || {};

      return {
        id: stageId,
        userValues: toMerged(yml.stages?.[stageId] || {}, {
          abort_on_fail,
          should_always_run,
        }),
      };
    });
  });
};

export default usePipelineStages;
