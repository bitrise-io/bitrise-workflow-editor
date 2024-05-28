import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useSearchParams from './useSearchParams';
import useBitriseYmlStore from './useBitriseYmlStore';

const usePipelineSelector = () => {
  const options = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return Object.fromEntries(
        Object.entries(yml.pipelines ?? {}).map(([pipelineKey, pipeline]) => {
          return [pipelineKey, pipeline.title || pipelineKey];
        }),
      );
    }),
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const keys = Object.keys(options);
  const searchedPipeline = searchParams.get('pipeline') || keys[0];
  const selectedPipeline = keys.includes(searchedPipeline) ? searchedPipeline : keys[0];

  const onSelectPipeline = useCallback(
    (key: string) => {
      setSearchParams((prevSearchParams) => {
        const newSearchParams = new URLSearchParams(prevSearchParams);
        newSearchParams.set('pipeline', key);
        return newSearchParams;
      });
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
