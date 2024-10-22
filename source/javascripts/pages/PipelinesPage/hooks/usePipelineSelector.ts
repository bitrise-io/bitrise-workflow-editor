import { useCallback } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { PipelineYmlObject } from '@/core/models/Pipeline';
import useSearchParams from '@/hooks/useSearchParams';

const usePipelineSelector = () => {
  const options = useBitriseYmlStore(({ yml }) => {
    return Object.fromEntries(
      Object.entries<PipelineYmlObject>(yml.pipelines ?? {}).map(([pipelineKey, pipeline]) => {
        return [pipelineKey, pipeline.title || pipelineKey];
      }),
    );
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const keys = Object.keys(options);
  const searchedPipeline = searchParams.pipeline || keys[0];
  const selectedPipeline = keys.includes(searchedPipeline) ? searchedPipeline : keys[0];

  const onSelectPipeline = useCallback(
    (key: string) => {
      setSearchParams((prevSearchParams) => ({
        ...prevSearchParams,
        pipeline: key,
      }));
    },
    [setSearchParams],
  );

  return {
    keys,
    options,
    selectedPipeline,
    onSelectPipeline,
  };
};

export default usePipelineSelector;
