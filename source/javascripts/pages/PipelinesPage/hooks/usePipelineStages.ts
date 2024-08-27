import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Stage, StageYmlObject } from '@/core/models/Stage';
import usePipelineSelector from './usePipelineSelector';

const usePipelineStages = (): Stage[] => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const pipelineStages: StageYmlObject[] = yml.pipelines?.[selectedPipeline].stages ?? [];

      return pipelineStages.map((pipelineStageObj) => {
        const stageId = Object.keys(pipelineStageObj)[0];
        const stage = Object.values(pipelineStageObj)[0];

        return {
          id: stageId,
          userValues: merge({}, yml.stages?.[stageId], stage),
        };
      });
    }),
  );
};

export default usePipelineStages;
