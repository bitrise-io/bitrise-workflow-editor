import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Pipeline } from '@/core/models/Pipeline';
import useSearchParams from '@/hooks/useSearchParams';

const usePipelineSelector = () => {
  const options = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return Object.fromEntries(
        Object.entries<Pipeline>(yml.pipelines ?? {}).map(([pipelineKey, pipeline]) => {
          return [pipelineKey, pipeline.title || pipelineKey];
        }),
      );
    }),
  );

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
