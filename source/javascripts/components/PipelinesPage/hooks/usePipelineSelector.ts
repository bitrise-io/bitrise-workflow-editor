import { Pipelines } from '../PipelinesPage.types';
import useSearchParams from './useSearchParams';

const usePipelineSelector = (pipelines?: Pipelines) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const options = Object.fromEntries(
    Object.entries(pipelines ?? {}).map(([key, pipeline]) => {
      return [key, pipeline.title || key];
    }),
  );

  const selectedPipeline = searchParams.pipeline || undefined;

  const onSelectPipeline = (key: string) => {
    setSearchParams((prevSearchParams) => ({ ...prevSearchParams, pipeline: key }));
  };

  return {
    options,
    selectedPipeline,
    onSelectPipeline,
  };
};

export default usePipelineSelector;
