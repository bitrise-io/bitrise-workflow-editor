import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { Stage } from '../PipelinesPage.types';
import useBitriseYmlStore from './useBitriseYmlStore';
import usePipelineSelector from './usePipelineSelector';

const usePipelineStages = () => {
  const { selectedPipeline } = usePipelineSelector();

  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const pipelineStages = yml.pipelines?.[selectedPipeline].stages ?? [];

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
