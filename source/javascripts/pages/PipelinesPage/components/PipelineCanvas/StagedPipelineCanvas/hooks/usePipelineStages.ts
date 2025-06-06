import { toMerged } from 'es-toolkit';

import { PipelineStages } from '@/core/models/BitriseYml';
import { Stage } from '@/core/models/Stage';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';

const usePipelineStages = (): Stage[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(({ yml }) => {
    const pipelineStages: PipelineStages = yml.pipelines?.[selectedPipeline]?.stages ?? [];

    return pipelineStages.map((pipelineStageObj) => {
      const stageId = Object.keys(pipelineStageObj)[0];
      const stage = Object.values(pipelineStageObj)[0];

      return {
        id: stageId,
        userValues: toMerged(yml.stages?.[stageId] || {}, {
          abort_on_fail: stage?.abort_on_fail,
          should_always_run: stage?.should_always_run,
        }),
      };
    });
  });
};

export default usePipelineStages;
