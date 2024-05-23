import { Pipelines } from '../PipelinesPage.types';
import { usePageProps } from '../providers/PagePropsProvider';

const usePipelineSelector = (pipelines?: Pipelines) => {
  const { selectedPipeline, onSelectPipeline } = usePageProps();

  const options = Object.fromEntries(
    Object.entries(pipelines ?? {}).map(([key, pipeline]) => {
      return [key, pipeline.title || key];
    }),
  );

  return {
    options,
    selectedPipeline,
    onSelectPipeline,
  };
};

export default usePipelineSelector;
