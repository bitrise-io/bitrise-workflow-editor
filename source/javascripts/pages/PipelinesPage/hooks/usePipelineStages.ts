import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';

import usePipelineSelector from './usePipelineSelector';
import { Stage } from '@/models/domain/Stage';
import useBitriseYmlStore from '@/hooks/domain/useBitriseYmlStore';

const usePipelineStages = () => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const pipelineStages: Stage[] = yml.pipelines?.[selectedPipeline].stages ?? [];

      return Object.fromEntries(
        pipelineStages.map((pipelineStageObj) => {
          const stageId = Object.keys(pipelineStageObj)[0];
          const stage = Object.values(pipelineStageObj)[0];

          return [stageId, merge(yml.stages?.[stageId], stage) as Stage];
        }),
      );
    }),
  );
};

export default usePipelineStages;
